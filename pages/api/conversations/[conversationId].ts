import { AgentVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createLazyAuthHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';

const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['GET', 'DELETE', 'HEAD'],
});

export const getConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const conversationId = req.query.conversationId as string;
  const cursor = req.query.cursor as string;

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      agent: true,
      messages: {
        take: 50,
        ...(cursor
          ? {
              skip: 1,
              cursor: {
                id: cursor,
              },
            }
          : {}),
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (
    conversation?.agent?.visibility === AgentVisibility.private &&
    conversation?.agent?.ownerId !== session?.user?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return conversation;
};

handler.get(respond(getConversation));

export const deleteConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const conversationId = req.query.conversationId as string;
  const cursor = req.body.cursor as string;

  if (!session?.user) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      agent: true,
      messages: {
        take: -20,
        ...(cursor
          ? {
              cursor: {
                id: cursor,
              },
            }
          : {}),
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (conversation?.agent?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return conversation;
};

handler.delete(respond(deleteConversation));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
