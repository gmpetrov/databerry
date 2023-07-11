import { z } from 'zod';

export const NotionKeyConfig = z.object({
    config: z.object({ integrationKey: z.string().trim() }),
})

export type NotionKeyConfig = z.infer<typeof NotionKeyConfig>

export const NotionBlock = z.object({
    config: z.object({ pageId: z.string().trim() }),
    id: z.string().trim(),
})

export type NotionBlock = z.infer<typeof NotionBlock>

