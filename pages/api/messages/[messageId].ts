import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getMessage = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const messageId = req.query.messageId as string;
  const cursor = req.query.cursor as string;

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
    include: {
      conversation: {
        include: {
          agent: {
            include: {
              tools: true,
            },
          },
        },
      },
    },
  });

  return message;
};

handler.get(respond(getMessage));

export default handler;
