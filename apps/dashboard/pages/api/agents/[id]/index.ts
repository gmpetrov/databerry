import { NextApiResponse } from 'next';
import pMap from 'p-map';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { deleteFolderFromS3Bucket } from '@chaindesk/lib/aws';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import rateLimit from '@chaindesk/lib/middlewares/rate-limit';
import roles from '@chaindesk/lib/middlewares/roles';
import { ToolSchema, UpdateAgentSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { AgentVisibility, MembershipRole, Prisma } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const agentInclude: Prisma.AgentInclude = {
  organization: {
    select: {
      id: true,
      subscriptions: {
        select: {
          id: true,
        },
        where: {
          status: {
            in: ['active'],
          },
        },
      },
    },
  },
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
      form: true,
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
      ...(id.startsWith('@') ? { handle: id?.replace(/^@/, '') } : { id }),
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

handler.get(
  pipe(
    // rateLimit({
    //   duration: 60,
    //   limit: 30,
    // }),
    respond(getAgent)
  )
);

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

  const updatedTools = (data?.tools || []).filter(
    (tool) =>
      !newTools.find((one) => one.id === tool.id) &&
      !removedTools.find((one) => one.id === tool.id)
  );

  for (const [index, tool] of newTools.entries()) {
    if (!tool.serviceProviderId && !!tool.serviceProvider) {
      const created = await prisma.serviceProvider.create({
        data: {
          organization: {
            connect: {
              id: session.organization.id,
            },
          },
          owner: {
            connect: {
              id: session.user?.id,
            },
          },

          ...tool.serviceProvider,
        },
      });
      newTools[index].serviceProviderId = created.id;
    }
  }

  const { id, ownerId, organizationId, formId, organization, ...rest } =
    data as any;

  return prisma.agent.update({
    where: {
      id: agentId,
    },
    data: {
      ...(rest as UpdateAgentSchema),
      interfaceConfig: data.interfaceConfig || {},
      tools: {
        createMany: {
          data: newTools.map(
            ({
              serviceProviderId,
              serviceProvider,
              datastore, // ⚠️ do not remove datastore from spreading as passing the object to createMany will throw an error
              form, // Same
              type,
              ...otherToolProps
            }) => ({
              type,
              // TODO: fix tools types.
              ...(otherToolProps as Record<string, unknown>),
              ...(serviceProviderId ? { serviceProviderId } : {}),
            })
          ),
        },
        // TODO: fix tools types.
        updateMany: updatedTools.map((tool) => ({
          where: {
            id: tool.id,
          },
          data: {
            ...(tool?.type === 'http'
              ? {
                  config: tool.config,
                }
              : {}),
            ...(tool?.type === 'lead_capture'
              ? {
                  config: tool.config,
                }
              : {}),
          },
        })) as any,
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
  const orgId = req.session?.organization?.id;

  const agent = await prisma.agent.findUnique({
    where: {
      id,
    },
    include: {
      ...agentInclude,
    },
  });

  if (agent?.organizationId !== orgId) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const deleted = await prisma.agent.delete({
    where: {
      id,
    },
    select: {
      conversations: {
        select: {
          id: true,
        },
        where: {
          messages: {
            some: {
              attachments: {
                some: {
                  url: {
                    startsWith: 'http',
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // ATM conversation are deleted on cascade. Delete all conversations upload folders
  const keys = deleted.conversations.map(
    (conversation) => `organizations/${orgId}/conversations/${conversation.id}`
  );

  if (keys.length) {
    await pMap(
      keys,
      async (key) => {
        await deleteFolderFromS3Bucket(
          process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
          key
        );
      },
      {
        concurrency: 10,
      }
    );

    console.log(`${keys.length} deleted conversations upload folders`);
  }

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
