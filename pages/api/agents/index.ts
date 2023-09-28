import { AgentVisibility, ToolType } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { CreateAgentSchema, UpdateAgentSchema } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import validate from '@app/utils/validate';

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
            ...(tool.type === ToolType.datastore
              ? {
                  datastoreId: tool.datastoreId,
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
