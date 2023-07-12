import { IntegrationType } from '@prisma/client';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getCrispIntegrations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const agentId = req.query.agentId as string;

  const integrations = await prisma.externalIntegration.findMany({
    where: {
      type: IntegrationType.crisp,
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

handler.get(respond(getCrispIntegrations));

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export const deleteCrispIntegration = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as z.infer<typeof DeleteSchema>;

  const integration = await prisma.externalIntegration.findUnique({
    where: {
      id: data.id,
    },
    include: {
      agent: true,
    },
  });

  if (integration?.agent?.ownerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const deleted = await prisma.externalIntegration.delete({
    where: {
      id: data.id,
    },
  });

  return deleted;
};

handler.delete(respond(deleteCrispIntegration));

export default handler;
