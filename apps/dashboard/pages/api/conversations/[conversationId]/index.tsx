import Cors from 'cors';
import { NextApiResponse } from 'next';
import z from 'zod';

import IntegrationsEventDispatcher from '@app/utils/integrations-event-dispatcher';

import { ConversationResolved, HelpRequest, render } from '@chaindesk/emails';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { deleteFolderFromS3Bucket } from '@chaindesk/lib/aws';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import mailer from '@chaindesk/lib/mailer';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { ConversationUpdateSchema } from '@chaindesk/lib/types/dtos';
import { AppEventType, AppNextApiRequest } from '@chaindesk/lib/types/index';
import {
  Agent,
  AgentVisibility,
  Conversation,
  ConversationStatus,
  Prisma,
  ServiceProvider,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
const handler = createLazyAuthHandler();

export const getConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const conversationId = req.query.conversationId as string;
  const cursor = req.query.cursor as string;

  let conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      status: true,
      isAiEnabled: true,
      userId: true,
      agent: true,
      lead: true,
      messages: {
        take: 50,
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
        orderBy: {
          createdAt: 'desc',
        },
        ...(cursor
          ? {
              skip: 1,
              cursor: {
                id: cursor,
              },
            }
          : {}),
      },
    },
  });

  if (conversation) {
    conversation.messages = conversation?.messages?.map((each) => ({
      ...each,
      approvals: each.approvals?.map((approval) => ({
        ...approval,
        tool: {
          ...approval.tool,
          config: {
            name: (approval as any)?.tool?.config?.name || '',
          },
        },
      })),
    }));
  }

  if (
    conversation?.agent?.visibility === AgentVisibility.private &&
    conversation?.agent?.organizationId !== session?.organization?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return conversation;
};

handler.get(respond(getConversation));

export const updateConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const session = req.session;
    const conversationId = req.query.conversationId as string;
    const updates = ConversationUpdateSchema.parse(req.body);

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        agent: {
          include: {
            tools: {
              include: {
                serviceProvider: true,
              },
            },
            serviceProviders: true,
          },
        },
      },
    });
    if (
      conversation?.agent?.visibility === AgentVisibility.private &&
      conversation?.agent?.organizationId !== session?.organization?.id
    ) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }

    const updated = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        ...updates,
      },
      include: {
        lead: true,
        agent: true,
        messages: {
          take: -20,
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            attachments: true,
          },
        },
        organization: {
          include: {
            memberships: {
              where: {
                role: 'OWNER',
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const isAuthenticatedUser = !!session;

    if (!isAuthenticatedUser) {
      // Only send notification if action performed by a visitor

      const onwerEmail = updated?.organization?.memberships?.[0]?.user?.email!;
      const leadEmail = updated?.lead?.email!;
      const agent = updated?.agent!;

      if (updates.status === ConversationStatus.RESOLVED) {
        await mailer.sendMail({
          from: {
            name: 'Chaindesk',
            address: process.env.EMAIL_FROM!,
          },
          to: onwerEmail,
          subject: `✅ Conversation resolved automatically by ${
            agent?.name || ''
          }`,
          html: render(
            <ConversationResolved
              agentName={agent.name}
              messages={updated?.messages}
              ctaLink={`${
                process.env.NEXT_PUBLIC_DASHBOARD_URL
              }/logs?tab=all&conversationId=${encodeURIComponent(
                conversationId
              )}&targetOrgId=${encodeURIComponent(updated.organizationId!)}`}
            />
          ),
        });

        await IntegrationsEventDispatcher.dispatch(
          [
            ...((conversation?.agent?.serviceProviders ||
              []) as ServiceProvider[]),
          ],
          {
            type: AppEventType.MARKED_AS_RESOLVED,
            payload: {
              agent: conversation?.agent as Agent,
              conversation: conversation as Conversation,
              messages: updated?.messages,
              visitorEmail: leadEmail,
            },
          }
        );
      } else if (updates.status === ConversationStatus.HUMAN_REQUESTED) {
        await mailer.sendMail({
          from: {
            name: 'Chaindesk',
            address: process.env.EMAIL_FROM!,
          },
          to: onwerEmail,
          subject: `❓ Assistance requested from Agent ${agent?.name || ''}`,
          html: render(
            <HelpRequest
              visitorEmail={leadEmail}
              agentName={agent.name}
              messages={updated?.messages}
              ctaLink={`${
                process.env.NEXT_PUBLIC_DASHBOARD_URL
              }/logs?tab=human_requested&conversationId=${encodeURIComponent(
                conversationId
              )}&targetOrgId=${encodeURIComponent(updated.organizationId!)}`}
            />
          ),
        });

        await IntegrationsEventDispatcher.dispatch(
          [
            ...((conversation?.agent?.serviceProviders ||
              []) as ServiceProvider[]),
          ],
          {
            type: AppEventType.HUMAN_REQUESTED,
            payload: {
              agent: conversation?.agent as Agent,
              conversation: conversation as Conversation,
              messages: updated?.messages,
              visitorEmail: leadEmail,
            },
          }
        );
      }
    }

    return updated;
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        error: 'error invalid request query',
        details: e.format(),
      };
    } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: e.meta,
      };
    }
    throw e;
  }
};

handler.patch(respond(updateConversation));

export const deleteConversation = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const conversationId = req.query.conversationId as string;
  const cursor = req.body.cursor as string;

  if (!session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      agent: true,
      messages: {
        take: -20,
        ...(cursor
          ? {
              cursor: {
                id: cursor,
              },
            }
          : {}),
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (conversation?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });

  // Delete uploaded files
  await deleteFolderFromS3Bucket(
    process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    `organizations/${session?.organization?.id}/conversations/${conversation.id}`
  );

  return conversation;
};

handler.delete(respond(deleteConversation));

export default pipe(
  cors({ methods: ['GET', 'PATCH', 'DELETE', 'HEAD'] }),
  handler
);
