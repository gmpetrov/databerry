import { z } from 'zod';

export const NotionKeyConfig = z.object({
    config: z.object({ integrationKey: z.string().trim() }),
})

export type NotionKeyConfig = z.infer<typeof NotionKeyConfig>

export const NotionBlock = z.object({
    config: z.object({ pageId: z.string().trim() }),
    id: z.string().trim(),
    // hasChildren: z.boolean(),
    // type: z.string().trim()
})

export type NotionBlock = z.infer<typeof NotionBlock>

export const NotionBlockContent = z.object({
    rich_text: z.object({
        plain_text: z.string().trim().optional()
    })
})

export type NotionBlockContent = z.infer<typeof NotionBlockContent>
