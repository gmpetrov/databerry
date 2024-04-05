import { Prisma } from '@prisma/client';
import cuid from 'cuid';
import type { Logger } from 'pino';
import React from 'react';

import { GenericTemplate, NewConversation, render } from '@chaindesk/emails';
import guardAgentQueryUsage from '@chaindesk/lib/guard-agent-query-usage';
import {
  ConversationChannel,
  ConversationStatus,
  MembershipRole,
  MessageFrom,
  Prisma as PrismaType,
  PromptType,
  ToolType,
  Usage,
} from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import EventDispatcher from './events/dispatcher';
import { ChatRequest } from './types/dtos';
import AgentManager from './agent';
import { AnalyticsEvents, capture } from './analytics-server';
import { formatOrganizationSession, sessionOrganizationInclude } from './auth';
import { channelConfig, ModelConfig } from './config';
import ConversationManager from './conversation';
import getRequestLocation from './get-request-location';
import mailer from './mailer';
import { CUSTOMER_SUPPORT_BASE } from './prompt-templates';

export const ChatConversationArgs =
  Prisma.validator<PrismaType.ConversationDefaultArgs>()({
    include: {
      lead: true,
      participantsContacts: {
        take: 1,
      },
      messages: {
        take: -24,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

export type ChatConversationArgs = PrismaType.ConversationGetPayload<
  typeof ChatConversationArgs
>;

export const ChatAgentArgs = Prisma.validator<PrismaType.AgentDefaultArgs>()({
  include: {
    tools: {
      include: {
        datastore: true,
        form: true,
      },
    },
    organization: {
      include: {
        ...sessionOrganizationInclude,
        memberships: {
          where: {
            role: MembershipRole.OWNER,
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    },
  },
});

export type ChatAgentArgs = PrismaType.AgentGetPayload<typeof ChatAgentArgs>;

type Props = Omit<ChatRequest, 'isDraft' | 'streaming'> & {
  logger?: Logger;
  location?: ReturnType<typeof getRequestLocation>;
  userId?: string;
  agent: ChatAgentArgs;
  conversation?: ChatConversationArgs;
  handleStream?: any;
  abortController?: any;
  isDraft?: boolean;
  streaming?: boolean;
  channelExternalId?: string;
  channelCredentialsId?: string;
  externalMessageId?: string;
  externalVisitorId?: string;
};

async function handleChatMessage({ agent, conversation, ...data }: Props) {
  const usage = agent?.organization?.usage;

  const isNewConversation = !conversation?.id;
  const history = conversation?.messages || [];
  const channel = (data.channel ||
    ConversationChannel.dashboard) as ConversationChannel;
  const conversationId = conversation?.id || data.conversationId || cuid();
  const isDashboardMessage =
    channel === ConversationChannel.dashboard && !!data.userId;
  const visitorId = data.visitorId || cuid();

  let retrievalQuery = '';
  if (data.isDraft) {
    // Only use datastore when drafting a reply
    agent.tools = agent.tools?.filter((each) => each?.type === 'datastore');
    agent.modelName = 'gpt_3_5_turbo_16k';
    const lastFromHumanIndex = history
      .reverse()
      .findIndex((one) => one.from === MessageFrom.human);
    retrievalQuery = history?.[lastFromHumanIndex]?.text || '';
  }

  if (data.modelName) {
    // override modelName
    agent.modelName = data.modelName;
  }

  // promptType is now deprecated - patch until supported by the API
  if (data.promptType === PromptType.raw && data.promptTemplate) {
    agent.systemPrompt = '';
    agent.userPrompt = data.promptTemplate;
  } else if (data.promptType === PromptType.customer_support) {
    agent.systemPrompt = `${
      data.promptTemplate || agent.prompt
    } ${CUSTOMER_SUPPORT_BASE}`;
    agent.userPrompt = `{query}`;
  }

  if (data?.context?.trim()) {
    agent.systemPrompt = `${agent.systemPrompt}\n${data?.context?.trim()}`;
  }

  const filteredTools = (agent?.tools || []).filter((each) => {
    if (each?.type === ToolType.lead_capture) {
      // Disabled for the following channels
      if (
        [
          ConversationChannel.api,
          ConversationChannel.crisp,
          ConversationChannel.website,
          ConversationChannel.dashboard,
        ].includes(channel as any)
      ) {
        return false;
      }

      if (conversation?.status === ConversationStatus.HUMAN_REQUESTED) {
        return false;
      }

      // already captured lead or contact for the conversation
      if (
        !!conversation?.lead ||
        (conversation?.participantsContacts || [])?.length > 0
      ) {
        return false;
      }
    } else if (
      each?.type === ToolType.request_human ||
      each?.type === ToolType.mark_as_resolved
    ) {
      // Disabled for the following channels
      if ([ConversationChannel.crisp].includes(channel as any)) {
        return false;
      }

      if (conversation?.status === ConversationStatus.HUMAN_REQUESTED) {
        return false;
      }
    }
    return true;
  });

  // Disable markdown output for unsupported channels
  if (channelConfig[channel]?.isMarkdownCompatible === false) {
    agent.useMarkdown = false;
  }

  agent.tools = filteredTools;

  const manager = new AgentManager({ agent, topK: 50 });

  const conversationManager = new ConversationManager({
    channel,
    organizationId: agent?.organizationId!,
    formId: data.formId!,
    conversationId,
    channelExternalId: data?.channelExternalId,
    channelCredentialsId: data?.channelCredentialsId,
    ...(!data.userId && !!isNewConversation && data?.location?.country
      ? {
          metadata: {
            country: data.location.country,
          },
        }
      : {}),
    location: data.location,
  });

  const inputMessageId = cuid();

  if (!data.isDraft) {
    await conversationManager.createMessage({
      conversationStatus:
        conversation?.status === ConversationStatus.RESOLVED
          ? ConversationStatus.UNRESOLVED
          : conversation?.status,
      id: inputMessageId,
      from: MessageFrom.human,
      text: data.query,
      attachments: data.attachments,
      externalId: data.externalMessageId,
      externalVisitorId: data.externalVisitorId,

      visitorId: isDashboardMessage ? undefined : visitorId!,
      contactId: isDashboardMessage ? undefined : data.contactId!,
      userId: isDashboardMessage ? data.userId : undefined,
    });
  }

  if (!!conversation && !conversation?.isAiEnabled) {
    return {
      inputMessageId,
      conversationId,
      agentResponse: undefined,
      answerMsgId: undefined,
    };
  }

  try {
    const orgSession = formatOrganizationSession(agent?.organization!);
    const usage = orgSession?.usage as Usage;

    guardAgentQueryUsage({
      usage: usage!,
      plan: orgSession?.currentPlan,
    });
  } catch (err) {
    const email = agent?.organization?.memberships?.[0]?.user?.email!;

    if (!usage?.notifiedAgentQueriesLimitReached && email) {
      await Promise.all([
        mailer.sendMail({
          from: {
            name: 'Chaindesk',
            address: process.env.EMAIL_FROM!,
          },
          to: email,
          subject: `You've reached your usage limit`,
          html: render(
            <GenericTemplate
              title={'🚨 Usage Limit Reached'}
              description="You've reached your Agent queries quota. Your Agent will not be able to answer queries until you upgrade your account."
              cta={{
                label: 'Upgrade Account',
                href: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/settings/billing`,
              }}
            />
          ),
        }),
        prisma.usage.update({
          where: {
            id: usage?.id,
          },
          data: {
            notifiedAgentQueriesLimitReached: true,
          },
        }),
      ]);
    }

    throw err;
  }
  const [chatRes] = await Promise.all([
    manager.query({
      ...data,
      conversationId,
      channel,
      input: data.query,
      stream: data.streaming ? data.handleStream : undefined,
      history: history,
      abortController: data.abortController,
      filters: data.filters,
      toolsConfig: data.toolsConfig,
      retrievalQuery,
    }),
    prisma.usage.update({
      where: {
        id: agent?.organization?.usage?.id,
      },
      data: {
        nbAgentQueries:
          (agent?.organization?.usage?.nbAgentQueries || 0) +
          (ModelConfig?.[agent?.modelName].cost || 1),
      },
    }),
  ]);

  const answerMsgId = chatRes.messageId || cuid();

  if (!data.isDraft) {
    await conversationManager.createMessage({
      id: answerMsgId,
      inputId: inputMessageId,
      from: MessageFrom.agent,
      text: chatRes.answer,
      sources: chatRes.sources,
      usage: chatRes.usage,
      approvals: chatRes.approvals,
      metadata: chatRes.metadata,
      agentId: agent?.id,
    });

    if (chatRes.approvals.length > 0) {
      await EventDispatcher.dispatch({
        type: 'tool-approval-requested',
        conversationId,
        approvals: chatRes.approvals,
        agentName: agent?.name!,
      });
    }
  }

  // Send new conversation notfication from website visitor
  const ownerEmail = agent?.organization?.memberships?.[0]?.user?.email;
  if (
    !data.isDraft &&
    ownerEmail &&
    isNewConversation &&
    data.channel === ConversationChannel.website &&
    !data.userId
  ) {
    try {
      await mailer.sendMail({
        from: {
          name: 'Chaindesk',
          address: process.env.EMAIL_FROM!,
        },
        to: ownerEmail,
        subject: `💬 New conversation started with Agent ${agent?.name}`,
        html: render(
          <NewConversation
            agentName={agent.name}
            messages={[
              {
                id: '1',
                text: data.query,
                from: MessageFrom.human,
              },
              {
                id: '2',
                text: chatRes.answer,
                from: MessageFrom.agent,
              },
            ]}
            ctaLink={`${
              process.env.NEXT_PUBLIC_DASHBOARD_URL
            }/logs?tab=all&targetConversationId=${encodeURIComponent(
              conversationId
            )}&targetOrgId=${encodeURIComponent(agent.organizationId!)}`}
          />
        ),
      });
    } catch (err) {
      data?.logger?.error?.(err);
    }
  }

  capture?.({
    event: data.userId
      ? AnalyticsEvents.INTERNAL_AGENT_QUERY
      : AnalyticsEvents.EXTERNAL_AGENT_QUERY,
    payload: {
      isDraft: data.isDraft,
      userId: data.userId,
      agentId: agent?.id,
      organizationId: agent?.organizationId,
    },
  });

  return {
    agentResponse: chatRes,
    inputMessageId,
    answerMsgId,
    conversationId,
  };
}

export default handleChatMessage;
