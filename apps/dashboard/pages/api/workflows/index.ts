import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const listWorkflows = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  return prisma.workflow.findMany({
    where: {
      agent: {
        organizationId: session?.organization?.id,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

handler.get(respond(listWorkflows));
export default handler;
