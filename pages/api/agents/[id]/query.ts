import {
  AgentVisibility,
  ConversationChannel,
  MessageFrom,
  Usage,
} from '@prisma/client';
import Cors from 'cors';
import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';

import { AppNextApiRequest, SSE_EVENT } from '@app/types';
import { ChatRequest } from '@app/types/dtos';
import { queryCountConfig } from '@app/utils/account-config';
import AgentManager from '@app/utils/agent';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import ConversationManager from '@app/utils/conversation';
import { createLazyAuthHandler, respond } from '@app/utils/createa-api-handler';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import streamData from '@app/utils/stream-data';

const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const chatAgentRequest = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as ChatRequest;

  const conversationId = data.conversationId || cuid();

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      owner: {
        include: {
          usage: true,
          conversations: {
            where: {
              AND: {
                id: conversationId,
                agentId: id,
              },
            },
            include: {
              messages: {
                take: -4,
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
    agent?.ownerId !== session?.user?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const usage = agent?.owner?.usage as Usage;

  guardAgentQueryUsage({
    usage,
    plan: session?.user?.currentPlan,
  });

  if (data.modelName) {
    // override modelName
    agent.modelName = data.modelName;
  }

  const manager = new AgentManager({ agent, topK: 5 });
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
    channel: ConversationChannel.dashboard,
    agentId: agent?.id,
    userId: session?.user?.id,
    visitorId: data.visitorId!,
    conversationId,
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
      history: agent?.owner?.conversations?.[0]?.messages,
      abortController: ctrl,
      filters: data.filters,
    }),
    prisma.usage.update({
      where: {
        id: agent?.owner?.usage?.id,
      },
      data: {
        nbAgentQueries:
          (agent?.owner?.usage?.nbAgentQueries || 0) +
          (queryCountConfig?.[agent?.modelName] || 1),
      },
    }),
  ]);

  const answerMsgId = cuid();

  conversationManager.push({
    id: answerMsgId,
    from: MessageFrom.agent,
    text: chatRes.answer,
    sources: chatRes.sources,
  });

  await conversationManager.save();

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

handler.post(respond(chatAgentRequest));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
