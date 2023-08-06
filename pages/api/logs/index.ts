import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getLogs = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const cursor = req.query.cursor as string;

  const conversations = await prisma.conversation.findMany({
    where: {
      agent: {
        ownerId: session?.user?.id,
      },
    },
    take: 100,
    // skip: page * limit,

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
          messages: {
            where: {
              read: false,
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return conversations;
};

handler.get(respond(getLogs));

export default handler;
