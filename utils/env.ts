import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),

  APP_AWS_ACCESS_KEY: z.string().min(1),
  APP_AWS_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_S3_BUCKET_NAME: z.string().min(1),

  OPENAI_API_KEY: z.string().min(1),

  QDRANT_API_URL: z.string().url().trim(),
  QDRANT_API_KEY: z.string().min(1),

  GITHUB_ID: z.string().min(1),
  GITHUB_SECRET: z.string().min(1),

  EMAIL_SERVER: z.string().min(1),
  EMAIL_FROM: z.string().min(1),

  CRISP_HOOK_SECRET: z.string().optional(),
  CRISP_TOKEN_ID: z.string().optional(),
  CRISP_TOKEN_KEY: z.string().optional(),

  NOTION_CLIENT_ID: z.string().min(1),
  NOTION_CLIENT_SECRET: z.string().min(1),
});

// if (typeof window === 'undefined') {
//   envSchema.parse(process.env);
// }

export type ProcessEnv = z.infer<typeof envSchema>;
