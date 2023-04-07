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
  datasourceText: z.string().optional(),
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
