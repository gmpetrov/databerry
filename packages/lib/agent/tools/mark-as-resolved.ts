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

    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        status: ConversationStatus.RESOLVED,
      },
    });

    return {
      data: 'Conversation resolved successfully',
    };
  };
