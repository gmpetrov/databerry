import {
  ChatRequest,
  ToolResponseSchema,
  ToolSchema,
} from '@chaindesk/lib/types/dtos';

export type CreateToolHandler = (
  tool: ToolSchema,
  config?: Record<string, unknown>
) => (payload: unknown) => Promise<ToolResponseSchema>;

export type ToolToJsonSchema = (
  tool: ToolSchema,
  config?: Record<string, unknown>
) => any;
