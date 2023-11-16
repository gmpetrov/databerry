import { NextApiResponse } from 'next';
import { z } from 'zod';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { IntegrationType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
import validate from '@chaindesk/lib/validate';

const handler = createAuthApiHandler();

export const getAgentIntegrations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const agentId = req.query.agentId as string;
  const type = req.query.type as IntegrationType;

  const integrations = await prisma.externalIntegration.findMany({
    where: {
      type,
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

handler.get(respond(getAgentIntegrations));

const UpdateSchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1),
});

export const updateAgentIntegration = async (
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
    handler: respond(updateAgentIntegration),
  })
);

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export const deleteAgentIntegration = async (
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

  if (integration?.agent?.organizationId !== session?.organization?.id) {
    throw new Error('Unauthorized');
  }

  const deleted = await prisma.externalIntegration.delete({
    where: {
      id: data.id,
    },
  });

  return deleted;
};

handler.delete(respond(deleteAgentIntegration));

export default handler;
