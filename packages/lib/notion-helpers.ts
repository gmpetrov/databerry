import { APIResponseError, Client } from '@notionhq/client';

import sleep from './sleep';

export const NOTION_RETRIABLE_ERRORS = [
  'rate_limited',
  'internal_server_error',
];

const NotionBlocksContainers = [
  'database',
  'page',
  'child_page',
  'child_database',
] as const;

interface SelectedArgs {
  selectedNotebooks: { id: string; title: string }[];
  nestedPages?: Map<string, { id: string; title: string }>;
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

export function getNotebookTitle(
  notebook: Record<string, any>
): string | undefined {
  if (notebook?.title) {
    return getPlainText(notebook.title) || notebook?.title;
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
  }: {
    notebookId: string;
  }): Promise<string> {
    let content = '';
    try {
      const blocks = await this.getAllNotebookBlocks(notebookId);

      if (!blocks) {
        return content;
      }

      for (const block of blocks) {
        content += ' ' + getPlainText(block);

        if (
          (block as any).has_children &&
          !NotionBlocksContainers.includes((block as any).type)
        ) {
          const nestedContent = await this.getNotebookContent({
            notebookId: (block as any).id,
          });
          content += '' + nestedContent;
        }
      }

      return content;
    } catch (e) {
      return content;
    }
  }

  private async isDatabase(notebookId: string): Promise<boolean> {
    try {
      const response = await this.notionClient.databases.query({
        database_id: notebookId,
        page_size: 1,
      });
      return Boolean(response?.results?.length);
    } catch (e) {
      return false;
    }
  }

  async getNotebookUrl(notebookId: string): Promise<string | undefined> {
    try {
      const response = await this.notionClient.pages.retrieve({
        page_id: notebookId,
      });
      return (response as any).url;
    } catch (e) {
      console.error(`could not get the url for ${notebookId}`);
      return undefined;
    }
  }

  private async getAllNotebookBlocks(notebookId: string) {
    const maxTries = 5;
    const listChildren = async (
      cursor: string | undefined = undefined,
      accumulatedBlocks: any[] = []
    ): Promise<any[] | undefined> => {
      const response = await this.notionClient.blocks.children.list({
        block_id: notebookId,
        page_size: 100,
        start_cursor: cursor,
      });
      const blocks = [...accumulatedBlocks, ...response.results];
      if (!response.next_cursor) {
        return blocks;
      }
      const newBlocks = retryFn<any, any[] | undefined>(
        () => listChildren(response.next_cursor!, blocks),
        maxTries
      );
      return newBlocks;
    };

    const blocks = await retryFn<any, any[] | undefined>(
      () => listChildren(),
      maxTries
    );

    return blocks;
  }

  private async getPageIdsAndTitleForDatabase(
    database_id: string
  ): Promise<{ id: string; title: string }[]> {
    const response = await this.notionClient.databases.query({
      database_id,
    });
    const pages = (response as any).results.map((page: any) => ({
      id: page.id,
      title: getNotebookTitle(page),
    }));
    return pages as { id: string; title: string }[];
  }

  async getAllPagesFromSelection({
    selectedNotebooks,
    nestedPages = new Map<string, { id: string; title: string }>(),
  }: SelectedArgs) {
    const findNestedPages = async (
      notebookId: string,
      cursor: string | undefined = undefined
    ): Promise<void> => {
      try {
        const isDatabase = await this.isDatabase(notebookId);
        if (isDatabase) {
          const pages = await this.getPageIdsAndTitleForDatabase(notebookId);
          const pagesPromises = pages.map((page) => {
            if (!nestedPages.has(page.id)) {
              nestedPages.set(page.id, { id: page.id, title: page.title });
              return retryFn(() => findNestedPages(page.id), 5);
            }
          });
          await Promise.all(pagesPromises);
        }

        const response = await this.notionClient.blocks.children.list({
          block_id: notebookId,
          page_size: 100,
          start_cursor: cursor,
        });

        const nestedPagesPromises = response.results.map((block) => {
          if (NotionBlocksContainers.includes((block as any)?.type)) {
            if (!nestedPages.has(block.id)) {
              const title = getNotebookTitle(block);
              nestedPages.set(block.id, { id: block.id, title: title! });
              return retryFn(() => findNestedPages(block.id), 5);
            }
          }
        });
        await Promise.all(nestedPagesPromises);

        if (response.next_cursor) {
          return retryFn(
            () => findNestedPages(notebookId, response.next_cursor!),
            5
          );
        }
      } catch (e) {
        console.error(`notebook with id ${notebookId} was not found`);
        return;
      }
    };

    const nestedPagesPromises = selectedNotebooks.map((notebook) => {
      return retryFn(() => findNestedPages(notebook.id), 5);
    });

    await Promise.all(nestedPagesPromises);

    return [...selectedNotebooks, ...nestedPages.values()];
  }
}

export async function retryFn<Args extends any[] = any[], Response = any>(
  fn: (...args: Args) => Promise<Response>,
  maxTries: number,
  ...args: Args
): Promise<Response | undefined> {
  let tries = 0;
  while (tries <= maxTries) {
    try {
      return fn(...args);
    } catch (e) {
      if (
        APIResponseError.isAPIResponseError(e) &&
        NOTION_RETRIABLE_ERRORS.includes(e.code)
      ) {
        const waitTime = 500 * 2 ** tries;
        await sleep(waitTime);
        tries += 1;
      }
    }
  }
}
