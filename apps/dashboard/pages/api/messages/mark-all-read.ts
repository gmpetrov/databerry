import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export async function markAllRead(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  const session = req.session;

  const result = await prisma.message.updateMany({
    where: {
      conversation: {
        organizationId: session?.organization?.id,
      },
    },
    data: {
      read: true,
    },
  });

  return {
    count: result.count,
  };
}

handler.post(
  validate({
    handler: respond(markAllRead),
  })
);

export default handler;
