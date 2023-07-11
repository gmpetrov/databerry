import { z } from 'zod';

export const NotionMainPage = z.object({
    id: z.string().trim(),
    parent: z.object({
        type: z.string().trim()
    })
})

export type NotionMainPage = z.infer<typeof NotionMainPage>

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
