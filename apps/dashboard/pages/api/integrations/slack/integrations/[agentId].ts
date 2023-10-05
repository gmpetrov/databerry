import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { IntegrationType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getSlackIntegrations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const agentId = req.query.agentId as string;

  const integrations = await prisma.externalIntegration.findMany({
    where: {
      type: IntegrationType.slack,
      agent: {
        id: agentId,
        organizationId: session.organization.id,
      },
    },
    include: {
      agent: true,
    },
  });

  return integrations;
};

handler.get(respond(getSlackIntegrations));

export default handler;
