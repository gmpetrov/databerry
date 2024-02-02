import cuid from 'cuid';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { sessionOrganizationInclude } from '@chaindesk/lib/auth';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import getRequestCountry from '@chaindesk/lib/get-request-country';
import handleChatMessage, {
  ChatAgentArgs,
  ChatConversationArgs,
} from '@chaindesk/lib/handle-chat-message';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import rateLimit from '@chaindesk/lib/middlewares/rate-limit';
import streamData from '@chaindesk/lib/stream-data';
import { AppNextApiRequest, SSE_EVENT } from '@chaindesk/lib/types';
import { ChatRequest } from '@chaindesk/lib/types/dtos';
import {
  AgentVisibility,
  ConversationChannel,
  MembershipRole,
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
  const visitorId = data.visitorId || cuid();

  if (data.isDraft && !session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

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
      ...ChatAgentArgs.include,
      organization: {
        ...ChatAgentArgs.include?.organization,
        include: {
          conversations: {
            ...ChatConversationArgs,
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

  const handleStream = (data: string, event: SSE_EVENT) =>
    streamData({
      event: event || SSE_EVENT.answer,
      data,
      res,
    });

  const chatRes = await handleChatMessage({
    ...data,
    logger: req.logger,
    agent: agent as ChatAgentArgs,
    conversation: agent?.organization?.conversations?.[0],
    handleStream,
    abortController: ctrl,
    country: getRequestCountry(req),
    userId: session?.user?.id,
    visitorId,
  });

  if (data.streaming) {
    streamData({
      event: SSE_EVENT.endpoint_response,
      data: JSON.stringify({
        messageId: chatRes.answerMsgId,
        answer: chatRes?.agentResponse?.answer,
        sources: chatRes?.agentResponse?.sources,
        conversationId: chatRes.conversationId,
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
      ...chatRes.agentResponse,
      messageId: chatRes.answerMsgId,
      conversationId: chatRes.conversationId,
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
