import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import syncAiStatus from '@chaindesk/lib/sync-ai-status';
import { UpdateInboxConversationSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;

  const conversation = await prisma.conversation.findUnique({
    where: {
      id,
    },
    include: {
      agent: true,
      lead: true,
      contacts: true,
      assignees: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              read: false,
            },
          },
        },
      },
      messages: {
        take: -50,
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          attachments: true,
          approvals: {
            include: {
              tool: {
                select: {
                  config: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (conversation?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await prisma.message.updateMany({
    where: {
      conversationId: id,
    },
    data: {
      read: true,
    },
  });

  return conversation;
};

handler.get(respond(getConversation));

export const updateInboxConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = UpdateInboxConversationSchema.parse(req.body);

  const prev = await prisma.conversation.findUnique({
    where: {
      id,
    },
    include: {
      assignees: {
        select: {
          id: true,
        },
      },
    },
  });

  if (prev?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const { assignees, id: _id, ...otherProps } = data;

  const assigneesToRemove = prev?.assignees?.filter(
    (each) => !assignees?.some((p) => p === each.id)
  );
  const assigneesToCreate = assignees?.filter(
    (each) => !prev?.assignees?.some((p) => p.id === each)
  );

  const updated = await prisma.conversation.update({
    where: {
      id,
    },
    data: {
      ...otherProps,
      assignees: {
        disconnect: assigneesToRemove?.map(({ id: membershipId }) => ({
          id: membershipId,
          organizationId: session.organization?.id,
        })),
        connect: assigneesToCreate?.map((membershipId) => ({
          id: membershipId,
          organizationId: session.organization?.id,
        })),
      },
    },
  });

  if (updated.isAiEnabled !== prev?.isAiEnabled) {
    await syncAiStatus({
      channel: updated.channel,
      conversationId: updated.id,
      isAiEnabled: !!updated.isAiEnabled,
    });
  }

  return updated;
};

handler.patch(
  validate({
    body: UpdateInboxConversationSchema,
    handler: respond(updateInboxConversation),
  })
);

export default handler;
