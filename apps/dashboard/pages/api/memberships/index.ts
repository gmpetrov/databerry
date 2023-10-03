import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import uuidv4 from '@chaindesk/lib/uuidv4';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getMemberships = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const memberships = await prisma.membership.findMany({
    where: {
      organizationId: session?.organization?.id,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return memberships;
};

handler.get(respond(getMemberships));

export default handler;
