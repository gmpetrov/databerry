import { ConversationChannel, MessageFrom, Usage } from '@prisma/client';
import Cors from 'cors';
import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';

import { AppNextApiRequest, SSE_EVENT } from '@app/types';
import { RunChainRequest } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import ChainManager from '@app/utils/chains';
import ConversationManager from '@app/utils/conversation';
import { createAuthApiHandler } from '@app/utils/createa-api-handler';
import guardAgentQueryUsage from '@app/utils/guard-agent-query-usage';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import streamData from '@app/utils/stream-data';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const runChainRequest = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as RunChainRequest;

  const conversationId = data.conversationId || cuid();

  guardAgentQueryUsage({
    usage: session?.user?.usage,
    plan: session?.user?.currentPlan,
  });

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      messages: {
        take: -4,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  const datastores = data.filters?.datastore_ids?.length
    ? await prisma.datastore.findMany({
        where: {
          OR: data.filters?.datastore_ids?.map((each) => ({
            id: each,
          })),
        },
      })
    : [];

  datastores.forEach((each) => {
    if (each.ownerId !== session?.user?.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  });

  const datasources = data.filters?.datasource_ids?.length
    ? await prisma.appDatasource.findMany({
        where: {
          OR: data.filters?.datasource_ids?.map((each) => ({
            id: each,
          })),
        },
      })
    : [];

  datasources.forEach((each) => {
    if (each.ownerId !== session?.user?.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  });

  const manager = new ChainManager({});
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
    // agentId: agent?.id,
    userId: session?.user?.id,
    visitorId: data.visitorId!,
    conversationId,
  });

  conversationManager.push({
    from: MessageFrom.human,
    text: data.query,
  });

  const handleStream = (data: string) => {
    if (data) {
      streamData({
        event: SSE_EVENT.answer,
        data,
        res,
      });
    }
  };

  const [chatRes] = await Promise.all([
    manager.query({
      input: data.query,
      stream: data.streaming ? handleStream : undefined,
      history: conversation?.messages,
      temperature: data.temperature,
      promptTemplate: data.promptTemplate,
      promptType: data.promptType,
      filters: data.filters,
      httpResponse: res,
      abortController: ctrl,
    }),
    prisma.usage.update({
      where: {
        id: session?.user?.usage?.id,
      },
      data: {
        nbAgentQueries: (session?.user?.usage?.nbAgentQueries || 0) + 1,
        //   (queryCountConfig?.[agent?.modelName] || 1),
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

handler.post(
  validate({
    handler: runChainRequest,
    body: RunChainRequest,
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
