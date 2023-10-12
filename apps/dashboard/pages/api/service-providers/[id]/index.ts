import { ServiceProviderType } from '@prisma/client';
import { NextApiResponse } from 'next';
import z from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import prisma from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getServiceProvider = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.id as string;

  const provider = await prisma.serviceProvider.findUnique({
    where: {
      organizationId: req?.session?.organization?.id as string,
      id,
    },
  });

  if (provider?.organizationId !== req.session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return provider;
};

handler.get(respond(getServiceProvider));

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  agentId: z.string().min(1).optional(),
});

export const updateIntegration = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as z.infer<typeof UpdateSchema>;

  const integration = await prisma.serviceProvider.findUnique({
    where: {
      id,
    },
    include: {
      agents: true,
    },
  });

  if (
    integration?.organizationId !== session.organization.id &&
    integration?.agents?.[0]?.organizationId !== session.organization.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  let agent = undefined;

  if (data?.agentId) {
    agent = await prisma.agent.findUnique({
      where: {
        id: data.agentId,
      },
    });

    if (agent?.organizationId !== session.organization.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  }

  const updated = await prisma.serviceProvider.update({
    where: {
      id,
    },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(agent?.id
        ? {
            agents: {
              connect: {
                id: agent.id,
              },
            },
          }
        : {}),
    },
  });

  return updated;
};

handler.put(
  validate({
    body: UpdateSchema,
    handler: respond(updateIntegration),
  })
);

export const deleteIntegration = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const integration = await prisma.serviceProvider.findUnique({
    where: {
      id,
    },
    include: {
      agents: true,
    },
  });

  if (
    integration?.organizationId !== session.organization.id &&
    integration?.agents?.[0]?.organizationId !== session.organization.id
  ) {
    throw new Error('Unauthorized');
  }

  return prisma.serviceProvider.delete({
    where: {
      id,
    },
  });
};

handler.delete(respond(deleteIntegration));

export default handler;
