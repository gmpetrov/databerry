import Cors from 'cors';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import runMiddleware from '@chaindesk/lib/run-middleware';
import sleep from '@chaindesk/lib/sleep';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { AgentVisibility, Prisma } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export const getConversations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const agentId = req.query.agentId as string;
  const cursor = req.query.cursor as string;

  if (!session.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      channel: 'dashboard',
      userId: session?.user?.id,
      AND: [
        {
          organizationId: session.organization.id,
          // userId: session?.user?.id,
          participantsUsers: {
            some: {
              id: session?.user?.id,
            },
          },
        },
        // ...(agentId && agentId !== 'null' ? [{ agentId }] : []),
        ...(agentId && agentId !== 'null'
          ? [
              {
                participantsAgents: {
                  some: {
                    id: agentId,
                  },
                },
              },
            ]
          : []),
        ...(agentId === 'null'
          ? [
              {
                agent: {
                  is: null,
                },
              },
            ]
          : []),
      ],
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
