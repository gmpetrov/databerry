import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const getHistory = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const sessionId = req.query.sessionId as string;
  const agentId = req.query.id as string;
  const cursor = req.body.cursor as string;

  const conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          agentId,
        },
        {
          visitorId: sessionId,
        },
      ],
    },
    include: {
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

  return conversation;
};

handler.get(respond(getHistory));

export default handler;
