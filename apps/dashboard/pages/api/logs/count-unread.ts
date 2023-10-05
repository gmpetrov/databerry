import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

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
          organizationId: session?.organization?.id,
        },
      },
      read: false,
    },
  });

  return count;
};

handler.get(respond(countUnread));

export default handler;
