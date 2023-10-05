import { NextApiResponse } from 'next';
import { z } from 'zod';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import uuidv4 from '@chaindesk/lib/uuidv4';
import validate from '@chaindesk/lib/validate';
import { IntegrationType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

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

  if (integration?.agent?.organizationId !== session.organization.id) {
    throw new Error('Unauthorized');
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id: data.agentId,
    },
  });

  if (agent?.organizationId !== session.organization.id) {
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

  if (integration?.agent?.organizationId !== session.organization.id) {
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
