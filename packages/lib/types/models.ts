import { z } from 'zod';

import { DatasourceType, DatastoreType } from '@chaindesk/prisma';

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

export const DatasourceBaseSchema = z.object({
  id: z.string().trim().cuid().optional(),
  name: z.string().trim().optional(),
  datastoreId: z.string().trim().cuid(),
  datasourceText: z.string().optional(),
  isUpdateText: z.boolean().optional(),
});

export const DatasourceConfigBaseSchema = z.object({
  custom_id: z.string().optional(),
});

export const QAConfig = z.object({
  question: z.string().min(1).trim(),
  answer: z.string().min(1).trim(),
  source_url: z.union([z.string().url().nullish(), z.literal('')]),
  nbTokens: z.number().optional(),
});

export type QAConfig = z.infer<typeof QAConfig>;

export const DatasourceSchema = z.discriminatedUnion('type', [
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.text),
    config: DatasourceConfigBaseSchema.extend({
      source_url: z.union([z.string().url().nullish(), z.literal('')]),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.web_site),
    config: DatasourceConfigBaseSchema.extend({
      source_url: z.string().trim().optional(),
      sitemap: z.string().trim().optional(),
    }).refine(
      (data) => {
        if (data.sitemap) {
          return !!z
            .string()
            .url()
            .parse(data.sitemap, {
              path: ['sitemap'],
            });
        } else if (data.source_url) {
          return !!z
            .string()
            .url()
            .parse(data.source_url, {
              path: ['source_url'],
            });
        }

        return false;
      },
      {
        message: 'You must provide either a web site URL or a sitemap URL',
        path: ['source_url'],
      }
    ),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.web_page),
    config: DatasourceConfigBaseSchema.extend({
      source_url: z.string().trim().url(),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.file),
    file: z.any(),
    config: DatasourceConfigBaseSchema.extend({
      file_url: z.string().optional(),
      source_url: z.string().optional(),
      mime_type: z.string(),
      fileSize: z.number().optional(),
      fileUploadPath: z.string().optional(),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.google_drive_folder),
    config: DatasourceConfigBaseSchema.extend({
      mime_type: z.string().min(1),
      serviceProviderId: z.string().min(1),
      objectId: z.string().min(1),
      source_url: z.string().trim().optional(),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.google_drive_file),
    config: DatasourceConfigBaseSchema.extend({
      mime_type: z.string().min(1),
      serviceProviderId: z.string().min(1),
      objectId: z.string().min(1),
      source_url: z.string().trim().optional(),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.notion),
    config: DatasourceConfigBaseSchema.extend({
      serviceProviderId: z.string().min(1),
      notebooks: z.array(
        z.object({
          id: z.string().min(1),
          title: z.string(),
          url: z.string().optional(),
        })
      ),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.notion_page),
    config: DatasourceConfigBaseSchema.extend({
      serviceProviderId: z.string().min(1),
      notebooks: z.array(
        z.object({
          id: z.string().min(1),
          title: z.string(),
          url: z.string().optional(),
        })
      ),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.qa),
    config: QAConfig.optional(),
  }),
]);

export type DatasourceSchema = z.infer<typeof DatasourceSchema>;

export const AgentInterfaceConfig = z.object({
  displayName: z.string().trim().optional(),
  primaryColor: z
    .string()
    .refine((val) => /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(val), {
      message: 'Invalid hex color',
    })
    .optional(),
  initialMessage: z.string().trim().optional(),
  isInitMessagePopupDisabled: z.boolean().optional(),
  isHumanRequestedDisabled: z.boolean().optional(),
  isMarkAsResolvedDisabled: z.boolean().optional(),
  isLeadCaptureDisabled: z.boolean().optional(),
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
  rateLimit: z
    .object({
      enabled: z.boolean().optional(),
      maxQueries: z
        .number()
        .or(z.string().pipe(z.coerce.number().positive()))
        .optional(),
      interval: z
        .number()
        .or(z.string().pipe(z.coerce.number().positive()))
        .optional(),
      limitReachedMessage: z.string().optional(),
    })
    .optional(),
});

export type AgentInterfaceConfig = z.infer<typeof AgentInterfaceConfig>;
