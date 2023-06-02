import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const countUnread = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const count = await prisma.message.count({
    where: {
      conversation: {
        agent: {
          ownerId: session?.user?.id,
        },
      },
      read: false,
    },
  });

  return count;
};

handler.get(respond(countUnread));

export default handler;
