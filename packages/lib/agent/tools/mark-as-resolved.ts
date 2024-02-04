import EventDispatcher from '@chaindesk/lib/events/dispatcher';
import {
  MarkAsResolvedToolSchema,
  ToolResponseSchema,
} from '@chaindesk/lib/types/dtos';
import { ConversationStatus } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import { CreateToolHandlerConfig, ToolToJsonSchema } from './type';

export type MarkAsResolvedToolPayload = Record<string, unknown>;

export const toJsonSchema = ((tool: MarkAsResolvedToolSchema, config) => {
  return {
    name: `mark_as_resolved`,
    description: 'Useful for marking the conversation as resolved.',
    parameters: {},
  };
}) as ToolToJsonSchema;

export const createHandler =
  (
    tool: MarkAsResolvedToolSchema,
    config: CreateToolHandlerConfig<{ type: 'mark_as_resolved' }>
  ) =>
  async (payload: MarkAsResolvedToolPayload): Promise<ToolResponseSchema> => {
    const conversationId = config?.conversationId as string;

    const updated = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      include: {
        participantsAgents: {
          where: {
            id: config?.agentId as string,
          },
          include: {
            serviceProviders: true,
          },
        },
        messages: {
          take: -24,
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
              take: 1,
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
      data: {
        status: ConversationStatus.RESOLVED,
      },
    });

    await EventDispatcher.dispatch({
      type: 'conversation-resolved',
      agent: updated?.participantsAgents[0],
      conversation: updated,
      messages: updated?.messages,
      adminEmail: updated?.organization?.memberships?.[0]?.user?.email!,
    });

    return {
      data: 'Conversation resolved successfully',
    };
  };
