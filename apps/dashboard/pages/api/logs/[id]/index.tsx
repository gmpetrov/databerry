import { NextApiResponse } from 'next';

import { GenericTemplate, NewConversation, render } from '@chaindesk/emails';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import mailer from '@chaindesk/lib/mailer';
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
      participantsContacts: true,
      assignees: {
        select: {
          id: true,
        },
      },
      mailInbox: {
        select: {
          id: true,
          name: true,
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

  const { assignees: _assignees, id: _id, ...otherProps } = data;
  const assignees = _assignees?.filter((each) => !!each) as string[];

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
    include: {
      assignees: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
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

  if (
    updated?.assignees?.[0]?.id &&
    updated?.assignees?.[0]?.id !== prev?.assignees?.[0]?.id &&
    updated?.assignees?.[0]?.user?.id !== session?.user?.id
  ) {
    // SEND Email
    await mailer.sendMail({
      from: {
        name: 'Chaindesk',
        address: process.env.EMAIL_FROM!,
      },
      to: updated?.assignees?.[0]?.user?.email!,
      subject: `You've been assigned a conversation`,
      html: render(
        <GenericTemplate
          title={'Conversation Assigned'}
          description={`${
            session?.user?.name || session?.user?.email
          } has assigned you a conversation`}
          cta={{
            label: 'View Conversation',
            href: `${
              process.env.NEXT_PUBLIC_DASHBOARD_URL
            }/logs?tab=all&conversationId=${encodeURIComponent(
              id
            )}&targetOrgId=${encodeURIComponent(session?.organization.id!)}`,
          }}
        />
      ),
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
