import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { sessionOrganizationInclude } from '@app/utils/auth';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';

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
