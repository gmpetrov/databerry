import { IntegrationType } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

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
        ownerId: session.user.id,
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
