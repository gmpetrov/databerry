import { APIResponseError, Client } from '@notionhq/client';
import { Arguments } from 'swr';

import sleep from './sleep';

export const NOTION_RETRIABLE_ERRORS = ['rate_limited', 'internal_server_error'];

const NotionBlocksContainers = ['database', 'page', 'child_page', 'child_database'] as const;

interface MemoizedValue {
    [key: string]: {
        text: string;
        url: string;
    };
}

interface Args {
    notebookId: string,
    memoizedValue?: MemoizedValue,
    processedBlocks?: { [key: string]: true }
}

export function getPlainText(obj: Record<string, any>): string {
    if (obj?.plain_text) {
        return obj.plain_text;
    }

    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            const result = getPlainText(obj[key]);
            if (result) {
                return result;
            }
        }
    }

    return '';
}

export function getNotebookTitle(notebook: Record<string, any>): string | undefined {
    if (notebook?.title) {
        return getPlainText(notebook.title);
    }

    for (const key in notebook) {
        if (typeof notebook[key] === 'object') {
            const title = getNotebookTitle(notebook[key]);
            if (title) {
                return title;
            }
        }
    }
}

export class NotionToolset {
    private readonly notionClient: Client;
    constructor(private readonly accessToken: string) {
        this.notionClient = new Client({
            auth: this.accessToken,
        });
    }

    async getNotebookContent({
        notebookId,
        memoizedValue = {},
        processedBlocks = {}
    }: Args): Promise<MemoizedValue> {
        if (memoizedValue[notebookId]) {
            return memoizedValue;
        }
        const isDatabase = await this.isDatabase(notebookId)

        if (isDatabase) {
            const pageIds = await retryFn(() => this.getPageIdsForDatabase(notebookId), 5)
            const contentPromises = (pageIds || []).map((id) => {
                return this.getNotebookContent({ notebookId: id, memoizedValue, processedBlocks })
            })
            await Promise.all(contentPromises)
        } else {
            const notebookUrl = await retryFn(() => this.getNotebookUrl(notebookId), 5)
            memoizedValue[notebookId] = { text: '', url: notebookUrl || '' };

            const blocks = await this.getAllNotebookBlocks(notebookId);

            if (!blocks) {
                return memoizedValue
            }

            for (const block of blocks) {
                if (processedBlocks[(block as any).id]) {
                    continue;
                }

                memoizedValue[notebookId].text += ' ' + getPlainText(block);
                processedBlocks[(block as any).id] = true;


                if ((block as any).has_children || NotionBlocksContainers.includes((block as any).type)) {
                    await this.getNotebookContent({
                        notebookId: (block as any).id,
                        memoizedValue,
                        processedBlocks
                    });
                }
            }

        }

        return memoizedValue;
    }

    private async isDatabase(notebookId: string): Promise<boolean> {
        try {
            const response = await this.notionClient.databases.query({
                database_id: notebookId,
                page_size: 1
            })
            return Boolean(response?.results?.length)
        } catch (e) {
            return false;
        }
    }

    private async getNotebookUrl(notebookId: string): Promise<string> {
        try {
            const response = await this.notionClient.pages.retrieve({ page_id: notebookId });
            return (response as any).url;
        } catch (e) {
            console.error(`could not get the url for ${notebookId}`);
            return '';
        }
    }

    private async getAllNotebookBlocks(notebookId: string) {
        const maxTries = 5;
        const listChildren = async (cursor: string | undefined = undefined, accumulatedBlocks: any[] = []): Promise<any[] | undefined> => {
            const response = await this.notionClient.blocks.children.list({
                block_id: notebookId,
                page_size: 100,
                start_cursor: cursor
            });
            const blocks = [...accumulatedBlocks, ...response.results];
            if (!response.next_cursor) {
                return blocks;
            }
            const newBlocks = retryFn<any, any[] | undefined>(() => listChildren(response.next_cursor!, blocks), maxTries)
            return newBlocks
        }

        const blocks = await retryFn<any, any[] | undefined>(() => listChildren(), maxTries)

        return blocks
    }

    private async getPageIdsForDatabase(database_id: string) {
        const response = await this.notionClient.databases.query({
            database_id,
        })

        const pageIds = (response as any).results.map((page: any) => page.id)

        return pageIds as string[]
    }
}

export async function retryFn<Args extends any[] = any[], Response = any>(fn: (...args: Args) => Promise<Response>, maxTries: number, ...args: Args): Promise<Response | undefined> {
    let tries = 0;
    while (tries <= maxTries) {
        try {
            return fn(...args)
        } catch (e) {
            if (APIResponseError.isAPIResponseError(e) && NOTION_RETRIABLE_ERRORS.includes(e.code)) {
                const waitTime = 500 * 2 ** tries;
                await sleep(waitTime);
                tries += 1;
            }
        }
    }
}