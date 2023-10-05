import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import roles from '@chaindesk/lib/middlewares/roles';
import { UpdateAgentSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import {
  AgentVisibility,
  MembershipRole,
  Prisma,
  ToolType,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const agentInclude: Prisma.AgentInclude = {
  tools: {
    include: {
      datastore: {
        include: {
          _count: {
            select: {
              datasources: {
                where: {
                  status: {
                    in: ['running', 'pending'],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const getAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      ...agentInclude,
    },
  });

  if (
    agent?.visibility === AgentVisibility.private &&
    agent?.organizationId !== session?.organization?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return agent;
};

handler.get(respond(getAgent));

export const updateAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as UpdateAgentSchema;
  const session = req.session;
  const agentId = req.query.id as string;
  const agent = await prisma.agent.findUnique({
    where: {
      id: agentId,
    },
    include: {
      organization: true,
      ...agentInclude,
    },
  });

  if (!agent) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  if (agent?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const currentToolsSet = new Set(agent?.tools?.map((tool) => tool.id) || []);

  const newTools = (data?.tools || []).filter(
    (tool) => !currentToolsSet.has(tool.id!)
  );
  const removedTools = (agent?.tools || [])
    .filter(
      (tool) => !(data?.tools || []).map((tool) => tool.id).includes(tool.id)
    )
    .map((each) => ({ id: each.id }));

  return prisma.agent.update({
    where: {
      id: agentId,
    },
    data: {
      ...data,
      interfaceConfig: data.interfaceConfig || {},
      tools: {
        createMany: {
          data: newTools.map((tool) => ({
            type: tool.type,
            ...(tool.type === ToolType.datastore
              ? {
                  datastoreId: tool.datastoreId,
                }
              : undefined),
          })),
        },
        deleteMany: removedTools,
      },
    },
    include: {
      ...agentInclude,
    },
  });
};

handler.patch(
  validate({
    body: UpdateAgentSchema,
    handler: respond(updateAgent),
  })
);

export const deleteAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.id as string;

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      ...agentInclude,
    },
  });

  await prisma.agent.delete({
    where: {
      id,
    },
  });

  return agent;
};

handler.delete(
  pipe(
    roles([MembershipRole.ADMIN, MembershipRole.OWNER]),
    respond(deleteAgent)
  )
);

export default pipe(
  cors({ methods: ['GET', 'DELETE', 'PATCH', 'HEAD'] }),
  handler
);
