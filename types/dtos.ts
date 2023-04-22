import { AgentVisibility, ToolType } from '@prisma/client';
import { z } from 'zod';

import {
  DatastoreSchema,
  DocumentMetadataSchema,
  DocumentSchema,
} from './models';

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

export const SearchRequestSchema = z.object({
  query: z.string(),
  topK: z.number().default(3).optional(),
  filter: DocumentMetadataSchema.optional(),
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
    source: z.string().optional(),
  })
);

export const SearchSimpleResponseSchema = z.object({
  results: SearchResultsSchema,
});

export type SearchSimpleResponseSchema = z.infer<
  typeof SearchSimpleResponseSchema
>;

export const SearchResponseSchema = z.object({
  results: z.array(
    z.object({
      query: z.string(),
      results: SearchResultsSchema,
    })
  ),
});
export type SearchResponseSchema = z.infer<typeof SearchResponseSchema>;

export const UpsertRequestSchema = z.object({
  documents: z.array(DocumentSchema),
});

export type UpsertRequestSchema = z.infer<typeof UpsertRequestSchema>;

export const UpsertResponseSchema = z.object({
  ids: z.array(z.string()),
});

export type UpsertResponseSchema = z.infer<typeof UpsertResponseSchema>;

export const UpdateRequestSchema = DocumentSchema.extend({
  id: z.string().min(1),
});

export type UpdateRequestSchema = z.infer<typeof UpdateRequestSchema>;

export const UpdateResponseSchema = z.object({
  id: z.string(),
});

export type UpdateResponseSchema = z.infer<typeof UpdateResponseSchema>;

export const ChatRequest = z.object({
  query: z.string(),
});

export type ChatRequest = z.infer<typeof ChatRequest>;

export const ChatResponse = z.object({
  answer: z.string(),
});

export type ChatResponse = z.infer<typeof ChatResponse>;

export const UpsertAgentSchema = z.object({
  id: z.string().trim().cuid().optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().min(1),
  prompt: z.string().trim().optional().nullable(),
  visibility: z.nativeEnum(AgentVisibility).default('private'),
  tools: z
    .array(
      z.object({
        id: z.string().cuid(),
        type: z.nativeEnum(ToolType),
        name: z.string().trim().optional(),
        description: z.string().trim().optional(),
      })
    )
    .optional(),
  // .max(1),
});

export type UpsertAgentSchema = z.infer<typeof UpsertAgentSchema>;
