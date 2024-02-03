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

    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status: ConversationStatus.HUMAN_REQUESTED,
      },
    });

    return {
      data: 'Human operator has been requested. He will be with you shortly.',
    };
  };
