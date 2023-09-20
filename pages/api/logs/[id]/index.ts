import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const conversastion = await prisma.conversation.findUnique({
    where: {
      id,
    },
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
        take: -50,
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (conversastion?.agent?.organizationId !== session?.organization?.id) {
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

  return conversastion;
};

handler.get(respond(getConversation));

export default handler;
