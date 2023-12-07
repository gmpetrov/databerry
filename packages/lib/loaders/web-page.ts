import axios from 'axios';

import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceSchema } from '@chaindesk/lib/types/models';

import { ApiError, ApiErrorType } from '../api-error';
import cleanTextForEmbeddings from '../clean-text-for-embeddings';

import { DatasourceLoaderBase } from './base';

export const getTextFromHTML = async (html: string) => {
  const { load } = await import('cheerio');

  const $ = load(html);
  $('head').remove();
  $('footer').remove();
  $('header').remove();
  $('nav').remove();
  $('script').remove();
  $('style').remove();
  $('link').remove();
  $('svg').remove();
  $('img').remove();
  $('noscript').remove();
  const text = $('body').text();

  return text?.trim();
};

export const loadPageContent = async (url: string) => {
  try {
    const { data } = await axios(url, {
      headers: {
        'User-Agent': Date.now().toString(),
      },
    });

    const text = await getTextFromHTML(data);

    if (!text) {
      throw new Error('Empty body');
    }

    return data as string;
  } catch (err) {
    console.log('Error: Trying Plawright fallback');

    const res = await axios.get(`${process.env.BROWSER_API}/text?url=${url}`);

    return res?.data?.result || '';
  }
};

type DatasourceWebPage = Extract<DatasourceSchema, { type: 'web_page' }>;

export class WebPageLoader extends DatasourceLoaderBase<DatasourceWebPage> {
  getSize = async () => {
    const url = this.datasource.config['source_url'];

    const res = await axios.head(url);

    return (res?.headers['content-length'] as number) || 0;
  };

  async load() {
    const url = this.datasource.config['source_url'];

    const content = await loadPageContent(url);

    const text = await getTextFromHTML(content);

    if (!text) {
      throw new ApiError(ApiErrorType.EMPTY_DATASOURCE);
    }

    return [
      new AppDocument({
        pageContent: cleanTextForEmbeddings(text),
        metadata: {
          source_url: url,
          datastore_id: this.datasource.datastoreId!,
          datasource_id: this.datasource.id,
          datasource_name: this.datasource.name,
          datasource_type: this.datasource.type,
          custom_id: this.datasource?.config?.custom_id,
          tags: this.datasource?.config?.tags || [],
        },
      }),
    ];
  }
}
