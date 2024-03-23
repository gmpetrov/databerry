import {
  ConversationChannel,
  ConversationPriority,
  ConversationStatus,
  Prisma,
} from '@prisma/client';
import { NextApiResponse } from 'next';

import { AnalyticsEvents, capture } from '@chaindesk/lib/analytics-server';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import {
  AppNextApiRequest,
  MessageEvalUnion,
} from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getLogs = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const evalFilter = req.query.eval as MessageEvalUnion;
  const channelFilter = req.query.channel as ConversationChannel;
  const agentId = req.query.agentId as string;
  const conversationStatus = req.query.status as ConversationStatus | undefined;
  const priority = req.query.priority as ConversationPriority | undefined;
  const assigneeId = req.query.assigneeId as string | undefined;
  const unread = req.query.unread;

  const cursor = req.query.cursor as string;

  const conversations = await prisma.conversation.findMany({
    where: {
      AND: [
        {
          organizationId: session.organization?.id,
        },
        {
          ...(channelFilter
            ? { channel: channelFilter }
            : {
                // channel: {
                //   notIn: [ConversationChannel.dashboard],
                // },
              }),
        },
        // {
        //   agent: {
        //     organizationId: session.organization?.id,
        //   },
        // },
        ...(agentId
          ? [
              {
                agent: {
                  id: agentId,
                },
              },
            ]
          : []),
        ...(evalFilter
          ? [
              {
                messages: {
                  some: {
                    eval: evalFilter,
                  },
                },
              },
            ]
          : []),

        ...(conversationStatus
          ? [
              {
                OR: [
                  ...(conversationStatus === ConversationStatus.UNRESOLVED
                    ? [{ status: ConversationStatus.HUMAN_REQUESTED }]
                    : []),
                  {
                    status: conversationStatus,
                  },
                ],
              },
            ]
          : []),
        ...(priority
          ? [
              {
                priority,
              },
            ]
          : []),
        ...(assigneeId
          ? [
              {
                assignees: {
                  some: {
                    id: assigneeId,
                  },
                },
              },
            ]
          : []),
        ...(unread
          ? [
              {
                messages: {
                  some: {
                    read: false,
                  },
                },
              },
            ]
          : []),
      ],
    },
    take: 100,

    ...(cursor
      ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }
      : {}),
    include: {
      form: true,
      agent: true,
      lead: true,
      participantsVisitors: true,
      participantsContacts: true,
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
        take: 2,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  capture?.({
    event: AnalyticsEvents.INBOX_FILTER,
    payload: {
      userId: session.user?.id,
      organizationId: session.organization?.id,
      evalFilter,
      agentId,
      conversationStatus,
      unread,
    },
  });

  return conversations;
};

handler.get(respond(getLogs));

export default handler;
