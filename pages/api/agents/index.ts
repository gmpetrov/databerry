import { AgentVisibility, ToolType } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { UpsertAgentSchema } from '@app/types/dtos';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import cuid from '@app/utils/cuid';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import uuidv4 from '@app/utils/uuid';
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
      ownerId: session?.user?.id,
    },
    include: {
      owner: {
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

export const upsertAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as UpsertAgentSchema;
  const session = req.session;

  let existingAgent;
  if (data?.id) {
    existingAgent = await prisma.agent.findUnique({
      where: {
        id: data.id,
      },
      include: {
        tools: true,
      },
    });

    if (existingAgent?.ownerId !== session?.user?.id) {
      throw new Error('Unauthorized');
    }
  }

  const id = data?.id || cuid();

  const currentTools = existingAgent?.tools || [];
  const newTools = (data?.tools || []).filter(
    (tool) => !currentTools.find((one) => one.id === tool.id)
  );
  const removedTools = (existingAgent?.tools || [])
    .filter((tool) => !(data?.tools || []).find((one) => one.id === tool.id))
    .map((each) => ({ id: each.id }));

  const agent = await prisma.agent.upsert({
    where: {
      id,
    },
    create: {
      id,
      name: data.name || generateFunId(),
      description: data.description,
      modelName: data.modelName!,
      prompt: data.prompt,
      promptType: data.promptType,
      temperature: data.temperature,
      interfaceConfig: data.interfaceConfig || {},
      handle: data.handle,
      owner: {
        connect: {
          id: session?.user?.id,
        },
      },
      iconUrl: data.iconUrl,
      visibility: data.visibility || AgentVisibility.private,
      includeSources: data.includeSources,
      restrictKnowledge: data.restrictKnowledge,
      tools: {
        createMany: {
          data: (data.tools || []).map((tool) => ({
            type: tool.type,
            ...(tool.type === ToolType.datastore
              ? {
                  datastoreId: tool.id,
                }
              : {}),
          })),
        },
      },
    },
    update: {
      name: data.name || generateFunId(),
      description: data.description,
      visibility: data.visibility || AgentVisibility.private,
      modelName: data.modelName,
      prompt: data.prompt,
      promptType: data.promptType,
      temperature: data.temperature,
      interfaceConfig: data.interfaceConfig || {},
      iconUrl: data.iconUrl,
      handle: data.handle,
      includeSources: data.includeSources,
      restrictKnowledge: data.restrictKnowledge,
      tools: {
        createMany: {
          data: newTools.map((tool) => ({
            type: tool.type,
            ...(tool.type === ToolType.datastore
              ? {
                  datastoreId: tool.id,
                }
              : {}),
          })),
        },
        deleteMany: removedTools,
      },
    },
  });

  return agent;
};

handler.post(
  validate({
    body: UpsertAgentSchema,
    handler: respond(upsertAgent),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
