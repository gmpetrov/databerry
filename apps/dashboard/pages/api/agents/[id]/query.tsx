import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';

import { NewConversation, render } from '@chaindesk/emails';
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
import runMiddleware from '@chaindesk/lib/run-middleware';
import streamData from '@chaindesk/lib/stream-data';
import { AppNextApiRequest, SSE_EVENT } from '@chaindesk/lib/types';
import { ChatRequest } from '@chaindesk/lib/types/dtos';
import {
  AgentVisibility,
  ConversationChannel,
  MembershipRole,
  MessageFrom,
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

  const conversationId = data.conversationId || cuid();
  const isNewConversation = !data.conversationId;
  if (session?.authType == 'apiKey') {
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
            where: {
              AND: {
                id: conversationId,
                agentId: id,
              },
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

  guardAgentQueryUsage({
    usage,
    plan: orgSession?.currentPlan,
  });

  if (data.modelName) {
    // override modelName
    agent.modelName = data.modelName;
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
    organizationId: agent?.organizationId!,
    channel: data.channel,
    agentId: agent?.id,
    userId: session?.user?.id,
    visitorId: data.visitorId!,
    conversationId,
    ...(!session?.user && !!isNewConversation
      ? {
          metadata: {
            country: getRequestCountry(req),
          },
        }
      : {}),
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: data.query,
  });

  const handleStream = (data: string) =>
    streamData({
      event: SSE_EVENT.answer,
      data,
      res,
    });

  const [chatRes] = await Promise.all([
    manager.query({
      ...data,
      input: data.query,
      stream: data.streaming ? handleStream : undefined,
      history: agent?.organization?.conversations?.[0]?.messages,
      abortController: ctrl,
      filters: data.filters,
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

  conversationManager.push({
    id: answerMsgId,
    from: MessageFrom.agent,
    text: chatRes.answer,
    sources: chatRes.sources,
    usage: (chatRes as any).usage,
  });

  await conversationManager.save();

  // Send new conversation notfication from website visitor
  const ownerEmail = agent?.organization?.memberships?.[0]?.user?.email;
  if (
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
        visitorId: conversationManager.visitorId,
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
      visitorId: conversationManager.visitorId,
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
