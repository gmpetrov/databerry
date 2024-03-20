import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';

const handler = createAuthApiHandler();

import { load } from 'cheerio';
import { z } from 'zod';

import { AppNextApiRequest } from '@chaindesk/lib/types';

async function getMetadata(req: AppNextApiRequest) {
  const url = z.string().url().parse(req.query.url);

  const response = await fetch(url);

  if (!response.ok) {
    return {
      error: response.body,
    };
  }

  const body = await response.text();
  const $ = load(body);

  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogTitle = $('title').text();
  const ogDescription = $('meta[name="description"]').attr('content');

  if (!ogImage) {
    return {
      error: 'og image not found',
    };
  }

  return {
    ogImage,
    ogTitle,
    ogDescription,
    error: null,
  };
}

handler.get(respond(getMetadata));

export default handler;
