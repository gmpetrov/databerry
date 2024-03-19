import { Prettify } from '@chaindesk/lib/type-utilites';
import {
  ChatRequest,
  ToolResponseSchema,
  ToolSchema,
} from '@chaindesk/lib/types/dtos';
import {
  AgentModelName,
  ConversationChannel,
  ToolType,
} from '@chaindesk/prisma';

import { FormToolPayload } from './form';
import { HttpToolPayload } from './http';
import { LeadCaptureToolPayload } from './lead-capture';
import { MarkAsResolvedToolPayload } from './mark-as-resolved';
import { RequestHumanToolPayload } from './request-human';

export type CreateToolHandlerConfig<T> = Prettify<
  | {
      toolConfig?: Record<string, unknown>;
      conversationId?: ChatRequest['conversationId'];
      organizationId: string;
      agentId?: string;
    } & (T extends { type: 'http' } ? { modelName: AgentModelName } : {})
>;

export type HttpToolResponseSchema =
  | { approvalRequired: boolean; data?: undefined; metadata?: never }
  | { data: any; approvalRequired?: undefined; metadata?: never };

export type ToolPayload<T> = T extends { type: 'http' }
  ? HttpToolPayload
  : T extends { type: 'form' }
  ? FormToolPayload
  : T extends { type: 'mark_as_resolved' }
  ? MarkAsResolvedToolPayload
  : T extends { type: 'request_human' }
  ? RequestHumanToolPayload
  : T extends { type: 'lead_capture' }
  ? LeadCaptureToolPayload
  : unknown;

export type CreateToolHandler<T extends { type: ToolType }> = (
  tool: Prettify<ToolSchema & T>,
  config: CreateToolHandlerConfig<T>,
  channel?: ConversationChannel
) => (
  payload: ToolPayload<T>
) => Promise<
  T extends { type: 'http' } ? HttpToolResponseSchema : ToolResponseSchema
>;

export type ToolToJsonSchema = <T>(
  tool: Prettify<ToolSchema & T>,
  config?: CreateToolHandlerConfig<T>
) => any;
