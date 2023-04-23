import { IntegrationType } from '@prisma/client';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const getSlackIntegrations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const integrations = await prisma.externalIntegration.findMany({
    where: {
      type: IntegrationType.slack,
      agent: {
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

const UpdateSchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1),
});

export const updateSlackIntegration = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as z.infer<typeof UpdateSchema>;

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

  const agent = await prisma.agent.findUnique({
    where: {
      id: data.agentId,
    },
  });

  if (agent?.ownerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.externalIntegration.update({
    where: {
      id: data.id,
    },
    data: {
      agent: {
        connect: {
          id: agent.id,
        },
      },
    },
  });

  return updated;
};

handler.put(
  validate({
    body: UpdateSchema,
    handler: respond(updateSlackIntegration),
  })
);

const DeleteSchema = UpdateSchema.omit({
  agentId: true,
});

export const deleteSlackIntegration = async (
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

  const updated = await prisma.externalIntegration.delete({
    where: {
      id: data.id,
    },
  });

  return updated;
};

handler.delete(
  validate({
    body: DeleteSchema,
    handler: respond(deleteSlackIntegration),
  })
);

export default handler;
