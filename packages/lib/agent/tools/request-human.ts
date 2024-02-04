import EventDispatcher from '@chaindesk/lib/events/dispatcher';
import {
  RequestHumanToolSchema,
  ToolResponseSchema,
} from '@chaindesk/lib/types/dtos';
import { ConversationStatus } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import { CreateToolHandlerConfig, ToolToJsonSchema } from './type';

export type RequestHumanToolPayload = Record<string, unknown>;

export const toJsonSchema = ((tool: RequestHumanToolSchema, config) => {
  return {
    name: `request_human`,
    description: 'Useful for requesting a human operator.',
    parameters: {},
  };
}) as ToolToJsonSchema;

export const createHandler =
  (
    tool: RequestHumanToolSchema,
    config: CreateToolHandlerConfig<{ type: 'request_human' }>
  ) =>
  async (payload: RequestHumanToolPayload): Promise<ToolResponseSchema> => {
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
        status: ConversationStatus.HUMAN_REQUESTED,
      },
    });

    await EventDispatcher.dispatch({
      type: 'human-requested',
      agent: updated?.participantsAgents[0],
      conversation: updated,
      messages: updated?.messages,
      adminEmail: updated?.organization?.memberships?.[0]?.user?.email!,
    });

    return {
      data: 'Human operator has been requested. He will be with you shortly.',
    };
  };
