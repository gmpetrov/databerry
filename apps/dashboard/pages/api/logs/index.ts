import { Prisma } from '@prisma/client';
import { NextApiResponse } from 'next';

import { MessageEvalUnion } from '@app/components/ChatBox';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getLogs = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const filter = req.query.filter as MessageEvalUnion;

  const cursor = req.query.cursor as string;

  const filterClause = {
    where: {
      agent: {
        organizationId: session.organization?.id,
      },
      messages: {
        some: {
          eval: filter,
        },
      },
    },
  };
  const baseQuery = {
    where: {
      agent: {
        organizationId: session.organization?.id,
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
          createdAt: 'asc' as Prisma.SortOrder,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc' as Prisma.SortOrder,
    },
  };

  if (filter) {
    const conversations = await prisma.conversation.findMany({
      ...baseQuery,
      ...filterClause,
    });
    return conversations;
  }

  const conversations = await prisma.conversation.findMany({ ...baseQuery });

  return conversations;
};

handler.get(respond(getLogs));

export default handler;
