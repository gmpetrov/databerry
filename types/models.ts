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
  description: z.string().trim().optional().nullable(),
  pluginIconUrl: z.string().trim().optional().nullable(),
  pluginName: z.string().trim().max(20).optional().nullable(),
  pluginDescriptionForHumans: z.string().trim().max(100).optional().nullable(),
  pluginDescriptionForModel: z.string().trim().max(8000).optional().nullable(),
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

export const UpsertDatasourceSchema = z.object({
  id: z.string().trim().cuid().optional(),
  type: z.nativeEnum(DatasourceType),
  name: z.string().trim().optional(),
  datastoreId: z.string().trim().cuid(),
  datasourceText: z.string().optional(),
  isUpdateText: z.boolean().optional(),
  config: z.object({}).optional(),
});

export type UpsertDatasourceSchema = z.infer<typeof UpsertDatasourceSchema>;

export const AgentInterfaceConfig = z.object({
  displayName: z.string().trim().optional(),
  primaryColor: z.string().trim().optional(),
  initialMessage: z.string().trim().optional(),
  messageTemplates: z.array(z.string()).optional(),
  position: z.enum(['left', 'right']).optional(),
  authorizedDomains: z.array(z.string()).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  isBgTransparent: z.boolean().optional(),
  twitterURL: z.string().optional(),
  instagramURL: z.string().optional(),
  youtubeURL: z.string().optional(),
  tiktokURL: z.string().optional(),
  githubURL: z.string().optional(),
  websiteURL: z.string().optional(),
});

export type AgentInterfaceConfig = z.infer<typeof AgentInterfaceConfig>;
