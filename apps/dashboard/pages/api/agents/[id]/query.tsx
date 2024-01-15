import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';

import { GenericTemplate, NewConversation, render } from '@chaindesk/emails';
import AgentManager from '@chaindesk/lib/agent';
import { AnalyticsEvents, capture } from '@chaindesk/lib/analytics-server';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  formatOrganizationSession,
  sessionOrganizationInclude,
} from '@chaindesk/lib/auth';
import { ModelConfig } from '@chaindesk/lib/config';
import ConversationManager from '@chaindesk/lib/conversation';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import getRequestCountry from '@chaindesk/lib/get-request-country';
import guardAgentQueryUsage from '@chaindesk/lib/guard-agent-query-usage';
import mailer from '@chaindesk/lib/mailer';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import rateLimit from '@chaindesk/lib/middlewares/rate-limit';
import { CUSTOMER_SUPPORT_BASE } from '@chaindesk/lib/prompt-templates';
import runMiddleware from '@chaindesk/lib/run-middleware';
import streamData from '@chaindesk/lib/stream-data';
import { AppNextApiRequest, SSE_EVENT } from '@chaindesk/lib/types';
import { ChatRequest } from '@chaindesk/lib/types/dtos';
import {
  AgentVisibility,
  ConversationChannel,
  MembershipRole,
  MessageFrom,
  PromptType,
  Usage,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const chatAgentRequest = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as ChatRequest;

  const channel = data.channel || ConversationChannel.dashboard;
  const isDashboardMessage =
    channel === ConversationChannel.dashboard && !!session?.user?.id;
  const visitorId = data.visitorId || cuid();

  if (data.isDraft && !session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const isNewConversation = !data.conversationId;
  const conversationId = data.conversationId || cuid();
  if (
    session?.authType == 'apiKey' &&
    data.channel !== ConversationChannel.form
  ) {
    data.channel = ConversationChannel.api;
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
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
          conversations: {
            take: 1,
            where: {
              ...(data.isDraft
                ? {
                    id: conversationId,
                    organizationId: session?.organization?.id,
                  }
                : {
                    AND: {
                      id: conversationId,
                      participantsAgents: {
                        some: {
                          id,
                        },
                      },
                    },
                  }),
            },
            include: {
              messages: {
                take: -24,
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          },
        },
      },
      tools: {
        include: {
          datastore: true,
          form: true,
        },
      },
    },
  });

  if (!agent) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (
    agent?.visibility === AgentVisibility.private &&
    agent?.organizationId !== session?.organization?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  // Make sure the Agent has access to datastores passed as filters
  for (const datastoreId of data.filters?.datastore_ids || []) {
    if (!agent?.tools?.find((one) => one?.datastoreId === datastoreId)) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  }

  const orgSession =
    session?.organization || formatOrganizationSession(agent?.organization!);
  const usage = orgSession?.usage as Usage;

  try {
    guardAgentQueryUsage({
      usage,
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

  let retrievalQuery = '';
  if (data.isDraft) {
    // Only use datastore when drafting a reply
    agent.tools = agent.tools?.filter((each) => each?.type === 'datastore');
    agent.modelName = 'gpt_3_5_turbo_16k';
    const lastFromHumanIndex = (
      agent?.organization?.conversations?.[0]?.messages || []
    )
      .reverse()
      .findIndex((one) => one.from === MessageFrom.human);
    retrievalQuery =
      agent?.organization?.conversations?.[0]?.messages?.[lastFromHumanIndex]
        ?.text || '';
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

  const manager = new AgentManager({ agent, topK: 50 });
  const ctrl = new AbortController();

  if (data.streaming) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });

    req.socket.on('close', function () {
      ctrl.abort();
    });
  }

  const conversationManager = new ConversationManager({
    channel,
    organizationId: agent?.organizationId!,
    formId: data.formId!,
    conversationId,
    ...(!session?.user && !!isNewConversation
      ? {
          metadata: {
            country: getRequestCountry(req),
          },
        }
      : {}),
  });

  const inputMessageId = cuid();

  if (!data.isDraft) {
    await conversationManager.createMessage({
      id: inputMessageId,
      from: MessageFrom.human,
      text: data.query,
      attachments: data.attachments,

      visitorId: isDashboardMessage ? undefined : data.visitorId!,
      contactId: isDashboardMessage ? undefined : data.contactId!,
      userId: isDashboardMessage ? session?.user?.id : undefined,
    });
  }

  const handleStream = (data: string, event: SSE_EVENT) =>
    streamData({
      event: event || SSE_EVENT.answer,
      data,
      res,
    });

  const [chatRes] = await Promise.all([
    manager.query({
      ...data,
      conversationId,
      input: data.query,
      stream: data.streaming ? handleStream : undefined,
      history: agent?.organization?.conversations?.[0]?.messages,
      abortController: ctrl,
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

  const answerMsgId = cuid();

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
  }

  // Send new conversation notfication from website visitor
  const ownerEmail = agent?.organization?.memberships?.[0]?.user?.email;
  if (
    !data.isDraft &&
    ownerEmail &&
    isNewConversation &&
    data.channel === ConversationChannel.website &&
    !session?.user?.id
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
            }/logs?tab=all&conversationId=${encodeURIComponent(
              conversationId
            )}&targetOrgId=${encodeURIComponent(agent.organizationId!)}`}
          />
        ),
      });
    } catch (err) {
      req.logger.error(err);
    }
  }

  capture?.({
    event: session?.user?.id
      ? AnalyticsEvents.INTERNAL_AGENT_QUERY
      : AnalyticsEvents.EXTERNAL_AGENT_QUERY,
    payload: {
      isDraft: data.isDraft,
      userId: session?.user?.id,
      agentId: agent?.id,
      organizationId: session?.organization?.id,
    },
  });

  if (data.streaming) {
    streamData({
      event: SSE_EVENT.endpoint_response,
      data: JSON.stringify({
        messageId: answerMsgId,
        answer: chatRes.answer,
        sources: chatRes.sources,
        conversationId: conversationManager.conversationId,
        visitorId: visitorId,
      }),
      res,
    });

    streamData({
      data: '[DONE]',
      res,
    });
  } else {
    return {
      ...chatRes,
      messageId: answerMsgId,
      conversationId: conversationManager.conversationId,
      visitorId: visitorId,
    };
  }
};

handler.post(
  pipe(
    // rateLimit({
    //   duration: 60,
    //   limit: 30,
    //   // 30req/min
    // }),
    respond(chatAgentRequest)
  )
);

export default pipe(cors({ methods: ['POST', 'HEAD'] }), handler);
