import { Client } from '@notionhq/client';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { getNotebookTitle, retryFn } from '@chaindesk/lib/notion-helpers';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { NotionPages } from '@chaindesk/lib/types/notion';
import prisma from '@chaindesk/prisma/client';
const handler = createAuthApiHandler();

async function getSelectedPages(notion: Client) {
  const maxTries = 5;
  const findSelection = async (
    accumulatedResults: NotionPages['results'] = [],
    cursor: string | undefined = undefined
  ): Promise<NotionPages['results'] | undefined> => {
    const response = await notion.search({
      page_size: 100,
      start_cursor: cursor,
    });
    const newResults = [
      ...accumulatedResults,
      ...response.results.filter(
        (result: any) => result.parent.type === 'workspace'
      ),
    ];
    if (!response?.next_cursor) {
      return newResults;
    }
    return retryFn(findSelection, maxTries, newResults, response.next_cursor);
  };

  const results = retryFn(findSelection, maxTries);

  return results;
}

export const getNotebooks = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { providerId } = req.query;

    if (!providerId) {
      throw new Error('provider id is missing!');
    }
    const provider = await prisma.serviceProvider.findUnique({
      where: {
        id: providerId as string,
      },
      select: {
        organizationId: true,
        accessToken: true,
      },
    });

    if (provider?.organizationId !== req?.session?.organization?.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }

    if (!provider?.accessToken) {
      throw new Error('missing notion access token');
    }

    const notion = new Client({
      auth: provider.accessToken,
    });

    const results = await getSelectedPages(notion);

    return (results || []).reduce<{ title: string; id: string; url: string }[]>(
      (filteredPages, page) => {
        const title = getNotebookTitle(page);
        if (title) {
          filteredPages.push({ title, id: page.id, url: (page as any)?.url });
        }
        return filteredPages;
      },
      []
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};

handler.get(respond(getNotebooks));
export default handler;
