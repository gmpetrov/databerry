import Cors from 'cors';
import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import ChainManager from '@chaindesk/lib/chains';
import ConversationManager from '@chaindesk/lib/conversation';
import { createAuthApiHandler } from '@chaindesk/lib/createa-api-handler';
import guardAgentQueryUsage from '@chaindesk/lib/guard-agent-query-usage';
import runMiddleware from '@chaindesk/lib/run-middleware';
import streamData from '@chaindesk/lib/stream-data';
import { AppNextApiRequest, SSE_EVENT } from '@chaindesk/lib/types';
import { RunChainRequest } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { ConversationChannel, MessageFrom, Usage } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

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
    usage: session?.organization?.usage,
    plan: session?.organization?.currentPlan,
  });

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      messages: {
        take: -24,
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
    if (each.organizationId !== session?.organization?.id) {
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
    if (each.organizationId !== session?.organization?.id) {
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
    organizationId: session?.organization?.id,
    channel: ConversationChannel.dashboard,
    conversationId,
  });

  const conv = await conversationManager.createMessage({
    from: MessageFrom.human,
    text: data.query,
    userId: session?.user?.id,
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
      systemPrompt: data.systemPrompt,
      userPrompt: data.userPrompt,
      filters: data.filters,
      httpResponse: res,
      abortController: ctrl,

      // Deprecated
      promptTemplate: data.promptTemplate,
      promptType: data.promptType,
    }),
    prisma.usage.update({
      where: {
        id: session?.organization?.usage?.id,
      },
      data: {
        nbAgentQueries: (session?.organization?.usage?.nbAgentQueries || 0) + 1,
        //   (queryCountConfig?.[agent?.modelName] || 1),
      },
    }),
  ]);

  const answerMsgId = cuid();

  await conversationManager.createMessage({
    id: answerMsgId,
    from: MessageFrom.agent,
    text: chatRes.answer,
    sources: chatRes.sources,
    usage: (chatRes as any).usage,
    inputId: conv?.messages?.[0].id,
  });

  if (data.streaming) {
    streamData({
      event: SSE_EVENT.endpoint_response,
      data: JSON.stringify({
        messageId: answerMsgId,
        answer: chatRes.answer,
        sources: chatRes.sources,
        conversationId: conversationManager.conversationId,
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
      // visitorId: conversationManager.visitorId,
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
