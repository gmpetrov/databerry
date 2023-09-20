import { AgentVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createLazyAuthHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import sleep from '@app/utils/sleep';

const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

// TODO: Remove after deployment
export const getConversations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const conversationId = req.query.conversationId as string;
  const agentId = req.query.id as string;
  const cursor = req.query.cursor as string;

  if (!session.user) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      AND: {
        agent: {
          id: agentId,
          organizationId: session.organization.id,
        },
        userId: session.user.id,
      },
    },
    take: 20,
    orderBy: {
      createdAt: 'desc',
    },
    ...(cursor
      ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }
      : {}),
    include: {
      agent: true,
      _count: {
        select: {
          messages: true,
        },
      },

      messages: {
        take: 1,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return conversations;
};

handler.get(respond(getConversations));

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
