import EventDispatcher from '@chaindesk/lib/events/dispatcher';
import {
  RequestHumanToolSchema,
  ToolResponseSchema,
} from '@chaindesk/lib/types/dtos';
import { Agent, ConversationStatus } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

import { CreateToolHandlerConfig, ToolToJsonSchema } from './type';

export type RequestHumanToolPayload = Record<string, unknown>;

export const toJsonSchema = ((tool: RequestHumanToolSchema, config) => {
  return {
    name: `request_human`,
    description:
      'Request a human operator. Use this tool to request a human operator if the user is not satisfied with the assistant response.',
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

    const conversation = await prisma.conversation.update({
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

    let agent = conversation?.participantsAgents[0] as Agent;

    if (!agent) {
      agent = (await prisma.agent.findUnique({
        where: {
          id: config?.agentId as string,
          organizationId: config?.organizationId as string,
        },
        include: {
          serviceProviders: true,
        },
      })) as Agent;
    }

    if (conversation && agent) {
      await EventDispatcher.dispatch({
        type: 'human-requested',
        agent: agent,
        conversation: conversation,
        messages: conversation?.messages,
        adminEmail: conversation?.organization?.memberships?.[0]?.user?.email!,
      });

      return {
        data: 'Human operator has been requested. He will be with you shortly.',
      };
    }

    return {
      data: 'This is not the right tool to use.',
    };
  };
