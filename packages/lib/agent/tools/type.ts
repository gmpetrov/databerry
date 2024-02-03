import { Prettify } from '@chaindesk/lib/type-utilites';
import {
  ChatRequest,
  ToolResponseSchema,
  ToolSchema,
} from '@chaindesk/lib/types/dtos';
import { AgentModelName, ToolType } from '@chaindesk/prisma';

import { FormToolPayload } from './form';
import { HttpToolPayload } from './http';

export type CreateToolHandlerConfig<T> = Prettify<
  | {
      toolConfig?: Record<string, unknown>;
      conversationId?: ChatRequest['conversationId'];
    } & (T extends { type: 'http' } ? { modelName: AgentModelName } : {})
>;

export type HttpToolResponseSchema =
  | { approvalRequired: boolean; data?: undefined; metadata?: never }
  | { data: any; approvalRequired?: undefined; metadata?: never };

export type ToolPayload<T> = T extends { type: 'http' }
  ? HttpToolPayload
  : T extends { type: 'form' }
  ? FormToolPayload
  : unknown;

export type CreateToolHandler<T extends { type: ToolType }> = (
  tool: Prettify<ToolSchema & T>,
  config: CreateToolHandlerConfig<T>
) => (
  payload: ToolPayload<T>
) => Promise<
  T extends { type: 'http' } ? HttpToolResponseSchema : ToolResponseSchema
>;

export type ToolToJsonSchema = <T>(
  tool: Prettify<ToolSchema & T>,
  config?: CreateToolHandlerConfig<T>
) => any;
