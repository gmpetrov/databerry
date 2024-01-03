import Cors from 'cors';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import {
  CreateAgentSchema,
  UpdateAgentSchema,
} from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { AgentVisibility, ToolType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const getAgents = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const agents = await prisma.agent.findMany({
    where: {
      organizationId: session?.organization?.id,
      hidden: false,
    },
    include: {
      organization: {
        include: {
          subscriptions: true,
        },
      },
      tools: {
        select: {
          id: true,
          type: true,
          datastoreId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return agents;
};

handler.get(respond(getAgents));

export const createAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as CreateAgentSchema;
  const session = req.session;

  return prisma.agent.create({
    data: {
      ...data,
      name: data.name || generateFunId(),
      interfaceConfig: data.interfaceConfig || {},
      handle: data.handle,
      organization: {
        connect: {
          id: session?.organization?.id,
        },
      },
      visibility: data.visibility || AgentVisibility.private,
      tools: {
        createMany: {
          data: (data.tools || []).map((tool) => ({
            type: tool.type,
            config: (tool as any).config,
            ...(tool.type === ToolType.datastore
              ? {
                  datastoreId: tool.datastoreId,
                }
              : {}),
            ...(tool.type === ToolType.form
              ? {
                  formId: tool.formId,
                }
              : {}),
            ...(tool.serviceProviderId
              ? {
                  serviceProviderId: tool.serviceProviderId,
                }
              : {}),
          })),
        },
      },
    },
  });
};

handler.post(
  validate({
    body: CreateAgentSchema,
    handler: respond(createAgent),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
