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
  const evalFilter = req.query.eval as MessageEvalUnion;
  const agentId = req.query.agentId as MessageEvalUnion;

  const cursor = req.query.cursor as string;

  const conversations = await prisma.conversation.findMany({
    where: {
      AND: [
        {
          agent: {
            organizationId: session.organization?.id,
          },
        },
        ...(agentId
          ? [
              {
                agent: {
                  id: agentId,
                },
              },
            ]
          : []),
        ...(evalFilter
          ? [
              {
                messages: {
                  some: {
                    eval: evalFilter,
                  },
                },
              },
            ]
          : []),
      ],
    },
    take: 100,

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
