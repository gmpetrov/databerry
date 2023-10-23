import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const conversation = await prisma.conversation.findUnique({
    where: {
      id,
    },
    include: {
      agent: true,
      lead: true,
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
        take: -50,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (conversation?.agent?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await prisma.message.updateMany({
    where: {
      conversationId: id,
    },
    data: {
      read: true,
    },
  });

  return conversation;
};

handler.get(respond(getConversation));

export default handler;
