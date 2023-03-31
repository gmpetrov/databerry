import { DatasourceType, DatastoreType } from '@prisma/client';
import { z } from 'zod';

export const PineconeConfigSchema = z.object({
  apiKey: z.string().trim().min(3),
  indexName: z.string().trim().optional(),
  region: z.string().trim().default('us-east1-gcp'),
});

export type PineconeConfigSchema = z.infer<typeof PineconeConfigSchema>;

export const QdrantConfigSchema = z.object({
  // apiURL: z.string().trim().url().optional(),
  // apiKey: z.string().trim().min(3).optional(),
});

export const DatastoreSchema = z.object({
  id: z.string().trim().optional(),
  type: z.nativeEnum(DatastoreType),
  config: z.object({}).optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().min(1),
  // datasources: z.array(DatasourceSchema).optional(),
  isPublic: z.boolean().optional(),
  // config: z.union([PineconeConfigSchema]),
});
export const PineconeSchema = DatastoreSchema.extend({
  config: PineconeConfigSchema.optional(),
});
export const QdrantSchema = DatastoreSchema.extend({
  config: QdrantConfigSchema,
});

export type DatastoreSchema = z.infer<typeof DatastoreSchema>;

export const DocumentMetadataSchema = z.object({
  document_id: z.string().optional(),
  source: z.enum(['email', 'file', 'chat']).optional(),
  source_id: z.string().optional(),
  author: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const DocumentSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  metadata: DocumentMetadataSchema.optional(),
});

export const UpsertDatasourceSchema = z.object({
  id: z.string().trim().cuid().optional(),
  type: z.nativeEnum(DatasourceType),
  name: z.string().trim().optional(),
  datastoreId: z.string().trim().cuid(),
  datasourceText: z.string().optional(),
  config: z.object({}),
});

export type UpsertDatasourceSchema = z.infer<typeof UpsertDatasourceSchema>;
