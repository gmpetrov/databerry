import {
  AgentModelName,
  AgentVisibility,
  ConversationChannel,
  MessageEval,
  PromptType,
  ToolType,
} from '@prisma/client';
import { z } from 'zod';

import {
  BaseDocumentMetadataSchema,
  FileMetadataSchema,
  Source,
} from './document';
import { AgentInterfaceConfig, DatastoreSchema } from './models';
import { ChainType } from '.';

export const CreateDatastoreRequestSchema = DatastoreSchema.extend({
  id: z.string().trim().cuid().optional(),
});
export type CreateDatastoreRequestSchema = z.infer<
  typeof CreateDatastoreRequestSchema
>;

export const UpsertDatasourceRequestSchema = z.object({
  id: z.string().trim().cuid().optional(),
  datasourceText: z.string().optional(),
  config: z.object({}),
});

export const TaskLoadDatasourceRequestSchema = z.object({
  datasourceId: z.string().min(1),
  isUpdateText: z.boolean().optional().default(false),
});
export type TaskLoadDatasourceRequestSchema = z.infer<
  typeof TaskLoadDatasourceRequestSchema
>;

export const TaskRemoveDatasourceRequestSchema = z.object({
  datastoreId: z.string().min(1),
  datasourceId: z.string().min(1),
});
export type TaskRemoveDatasourceRequestSchema = z.infer<
  typeof TaskRemoveDatasourceRequestSchema
>;
export const TaskRemoveDatastoreSchema = z.object({
  datastoreId: z.string().min(1),
});
export type TaskRemoveDatastoreSchema = z.infer<
  typeof TaskRemoveDatasourceRequestSchema
>;

export const FiltersSchema = z.object({
  custom_id: z.string().optional(),
  datasource_id: z.string().cuid().optional(),
  datastore_ids: z.array(z.string().cuid()).optional(),
  datasource_ids: z.array(z.string().cuid()).optional(),
  custom_ids: z.array(z.string()).optional(),
});

export const SearchRequestSchema = z.object({
  query: z.string(),
  topK: z.number().default(5).optional(),
  tags: z.array(z.string()).optional(),
  filters: FiltersSchema.optional(),
});

export type SearchRequestSchema = z.infer<typeof SearchRequestSchema>;

export const SearchManyRequestSchema = z.object({
  queries: z.array(SearchRequestSchema),
});

export type SearchManyRequestSchema = z.infer<typeof SearchManyRequestSchema>;

const SearchResultsSchema = z.array(
  z.object({
    text: z.string(),
    score: z.number(),
    source_url: z.string().optional(),
  })
);

export const SearchSimpleResponseSchema = SearchResultsSchema;

export type SearchSimpleResponseSchema = z.infer<
  typeof SearchSimpleResponseSchema
>;

export const SearchResponseSchema = z.array(
  z.object({
    query: z.string(),
    results: SearchResultsSchema,
  })
);
export type SearchResponseSchema = z.infer<typeof SearchResponseSchema>;

export const UpsertDocumentSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  text: z.string().min(1),
  metadata: z
    .union([BaseDocumentMetadataSchema, FileMetadataSchema])
    .optional(),
});

export const UpsertRequestSchema = z.object({
  documents: z.array(UpsertDocumentSchema),
});

export type UpsertRequestSchema = z.infer<typeof UpsertRequestSchema>;

export const UpsertResponseSchema = z.object({
  ids: z.array(z.string()),
});

export type UpsertResponseSchema = z.infer<typeof UpsertResponseSchema>;

export const UpdateRequestSchema = UpsertDocumentSchema.extend({
  id: z.string().min(1),
});

export type UpdateRequestSchema = z.infer<typeof UpdateRequestSchema>;

export const UpdateResponseSchema = z.object({
  id: z.string(),
});

export type UpdateResponseSchema = z.infer<typeof UpdateResponseSchema>;

export const ChatModelConfigSchema = z.object({
  temperature: z.number().min(0.0).max(1.0).optional(),
  maxTokens: z.number().optional(),
  presencePenalty: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  topP: z.number().optional(),
});

export type ChatModelConfigSchema = z.infer<typeof ChatModelConfigSchema>;

export const ChatRequest = ChatModelConfigSchema.extend({
  query: z.string(),
  streaming: z.boolean().optional().default(false),
  visitorId: z.union([z.string().cuid().nullish(), z.literal('')]),
  conversationId: z.union([z.string().cuid().nullish(), z.literal('')]),
  channel: z.nativeEnum(ConversationChannel).default('dashboard'),
  truncateQuery: z.boolean().optional(),

  promptTemplate: z.string().optional(),
  promptType: z.nativeEnum(PromptType).optional(),

  modelName: z.nativeEnum(AgentModelName).optional(),

  filters: FiltersSchema.optional(),
});

export type ChatRequest = z.infer<typeof ChatRequest>;
export const RunChainRequest = ChatRequest.extend({
  chainType: z.nativeEnum(ChainType),
});

export type RunChainRequest = z.infer<typeof RunChainRequest>;

export const ChatResponse = z.object({
  answer: z.string(),
  sources: z.array(Source).optional(),
  conversationId: z.string().cuid(),
  visitorId: z.string().optional(),
  messageId: z.string().cuid(),
});

export type ChatResponse = z.infer<typeof ChatResponse>;

export const UpsertAgentSchema = z.object({
  id: z.string().trim().cuid().optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().min(1),
  prompt: z.string().trim().optional().nullable(),
  modelName: z
    .nativeEnum(AgentModelName)
    .default(AgentModelName.gpt_3_5_turbo)
    .optional(),
  temperature: z.number().default(0.0),
  iconUrl: z.string().trim().optional().nullable(),
  promptType: z.nativeEnum(PromptType).default('customer_support'),
  visibility: z.nativeEnum(AgentVisibility).default('private'),
  interfaceConfig: AgentInterfaceConfig.optional().nullable(),
  includeSources: z.boolean().optional().nullable(),
  restrictKnowledge: z.boolean().optional().nullable(),
  tools: z
    .array(
      z.object({
        id: z.string().cuid(),
        type: z.nativeEnum(ToolType),
        name: z.string().trim().optional(),
        description: z.string().trim().optional().nullable(),
      })
    )
    .optional(),
  // .max(1),
  handle: z
    .string()
    .trim()
    .max(15)
    .refine((val) => (!!val && val.length >= 4 ? true : false), {
      message: 'String must contain at least 4 character(s)',
    })
    .refine((val) => /^[a-zA-Z0-9_]+$/.test(val), {
      message: 'Must not contain special characters except for underscore _',
    })
    .refine((val) => !val.startsWith('_'), {
      message: 'Cannot start with _',
    })
    .refine((val) => !val.endsWith('_'), {
      message: 'Cannot end with _',
    })
    .transform((val) => val.toLowerCase())
    .optional()
    .nullable(),
});

export type UpsertAgentSchema = z.infer<typeof UpsertAgentSchema>;

export const AcceptedDatasourceMimeTypes = [
  'text/csv',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/json',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.presentation',
  // 'application/vnd.google-apps.spreadsheet',
] as const;

export const GenerateUploadLinkRequest = z.object({
  fileName: z.string(),
  type: z.enum(AcceptedDatasourceMimeTypes),
});

export type GenerateUploadLinkRequest = z.infer<
  typeof GenerateUploadLinkRequest
>;

export const EvalAnswer = z.object({
  messageId: z.string().cuid(),
  eval: z.nativeEnum(MessageEval),
});

export type EvalAnswer = z.infer<typeof EvalAnswer>;
