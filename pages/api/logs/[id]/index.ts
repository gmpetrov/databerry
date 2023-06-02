import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getMessages = async (
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
      agent: {
        select: {
          ownerId: true,
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

  if (conversastion?.agent?.ownerId !== session?.user?.id) {
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

  return conversastion?.messages;
};

handler.get(respond(getMessages));

export default handler;
