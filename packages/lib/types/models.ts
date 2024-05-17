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
  tags: z.array(z.string().max(25)).optional(),
});

export const QAConfig = DatasourceConfigBaseSchema.extend({
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
      black_listed_urls: z.array(z.string()).optional(),
    }).superRefine((data, ctx) => {
      if (data.sitemap) {
        const result = z
          .string()
          .url()
          .safeParse(data.sitemap, {
            path: ['sitemap'],
          });
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_string,
            validation: 'url',
            fatal: true,
            message: 'sitemap must be a valid url.',
            path: ['sitemap'],
          });
        }
      } else if (data.source_url) {
        const result = z.string().url().safeParse(data.source_url);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_string,
            validation: 'url',
            fatal: true,
            message: 'source_url must be a valid url.',
            path: ['source_url'],
          });
        }
      } else if (data.black_listed_urls) {
        data.black_listed_urls.forEach((url, index) => {
          const isNotValid =
            z
              .string()
              .url()
              .safeParse(url, {
                path: ['black_listed_urls'],
              }).success !== true;
          if (isNotValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_string,
              validation: 'url',
              message: 'invalid  url.',
              fatal: true,
              path: [`black_listed_urls.${index}`],
            });
          }
        });
      }
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.web_page),
    config: DatasourceConfigBaseSchema.extend({
      source_url: z.string().trim().url(),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.youtube_video),
    config: DatasourceConfigBaseSchema.extend({
      source_url: z
        .string()
        .trim()
        .url()
        .refine((url) => url.includes('youtube'), {
          message: 'URL must be a YouTube URL',
        }),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.youtube_bulk),
    config: DatasourceConfigBaseSchema.extend({
      source_url: z
        .string()
        .trim()
        .url()
        .refine((url) => url.includes('youtube'), {
          message: 'URL must be a YouTube URL',
        }),
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
    hasOptIn: z.boolean().optional(),
    config: DatasourceConfigBaseSchema.extend({
      mime_type: z.string().min(1),
      serviceProviderId: z.string().min(1),
      objectId: z.string().min(1),
      source_url: z.string().trim().optional(),
    }),
  }),
  DatasourceBaseSchema.extend({
    type: z.literal(DatasourceType.google_drive_file),
    hasOptIn: z.boolean().optional(),
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

export type DatasourceNotion = Extract<DatasourceSchema, { type: 'notion' }>;
export type DatasourceQA = Extract<DatasourceSchema, { type: 'qa' }>;
export type DatasourceFile = Extract<DatasourceSchema, { type: 'file' }>;
export type DatasourceText = Extract<DatasourceSchema, { type: 'text' }>;
export type DatasourceWebPage = Extract<DatasourceSchema, { type: 'web_page' }>;
export type DatasourceWebSite = Extract<DatasourceSchema, { type: 'web_site' }>;
export type DatasourceYoutube = Extract<
  DatasourceSchema,
  { type: 'youtube_bulk' | 'youtube_video' }
>;
export type DatasourceGoogleDrive = Extract<
  DatasourceSchema,
  { type: 'google_drive_file' | 'google_drive_folder' }
>;

export const AgentInterfaceConfig = z.object({
  displayName: z.string().trim().optional(),
  primaryColor: z.string().optional(),
  // .refine((val) => /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(val), {
  //   message: 'Invalid hex color',
  // })
  initialMessage: z.string().trim().optional(),
  initialMessages: z
    .array(z.string())
    .optional()
    .transform((arr) => arr?.filter((each) => !!each)),
  isInitMessagePopupDisabled: z.boolean().optional(),
  isHumanRequestedDisabled: z.boolean().optional(),
  isMarkAsResolvedDisabled: z.boolean().optional(),
  isLeadCaptureDisabled: z.boolean().optional(),
  isBrandingDisabled: z.boolean().optional(),
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
  customCSS: z.string().optional(),
  iconUrl: z.string().optional(),
  bubbleButtonStyle: z.any({}).optional(),
  bubbleIconStyle: z.any({}).optional(),
  iconStyle: z.any({}).optional(),
  rateLimit: z
    .object({
      enabled: z.boolean().optional(),
      maxQueries: z.coerce
        .number()
        .or(z.string().pipe(z.coerce.number().positive()))
        .optional(),
      interval: z.coerce
        .number()
        .or(z.string().pipe(z.coerce.number().positive()))
        .optional(),
      limitReachedMessage: z.string().optional(),
    })
    .optional(),
});

export type AgentInterfaceConfig = z.infer<typeof AgentInterfaceConfig> & {
  bubbleButtonStyle?: React.CSSProperties;
  bubbleIconStyle?: React.CSSProperties;
  iconStyle?: React.CSSProperties;
};
