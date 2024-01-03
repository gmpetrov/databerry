import {
  ChatRequest,
  ToolResponseSchema,
  ToolSchema,
} from '@chaindesk/lib/types/dtos';

export type CreateToolHandlerConfig = {
  toolConfig?: Record<string, unknown>;
  conversationId?: ChatRequest['conversationId'];
};

export type CreateToolHandler = (
  tool: ToolSchema,
  config?: CreateToolHandlerConfig
) => (payload: unknown) => Promise<ToolResponseSchema>;

export type ToolToJsonSchema = (
  tool: ToolSchema,
  config?: CreateToolHandlerConfig
) => any;
