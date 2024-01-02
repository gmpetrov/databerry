import { ToolResponseSchema, ToolSchema } from '@chaindesk/lib/types/dtos';

export type CreateToolHandler = (
  tool: ToolSchema
) => (payload: unknown) => Promise<ToolResponseSchema>;
