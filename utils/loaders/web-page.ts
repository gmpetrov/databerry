import axios from 'axios';
import { ConsoleCallbackHandler } from 'langchain/dist/callbacks';
import playwright from 'playwright';
import { z } from 'zod';

import { WebPageSourceSchema } from '@app/components/DatasourceForms/WebPageForm';
import { AppDocument } from '@app/types/document';

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
    // const { default: playwright } = await import('playwright');

    const customUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

    const browser = await playwright.chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: customUserAgent,
    });

    const page = await context.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 100000,
    });

    let content = await page.content();
    let text = (await getTextFromHTML(content))?.trim();

    if (!text) {
      console.log(
        "not text parssed from html, let's try again after 10 seconds"
      );
      await page.waitForTimeout(10000);
    }

    content = await page.content();
    text = (await getTextFromHTML(content))?.trim();

    await context.close();
    await browser.close();

    return text;
  }
};

export class WebPageLoader extends DatasourceLoaderBase {
  getSize = async () => {
    const url: string = (
      this.datasource.config as z.infer<typeof WebPageSourceSchema>['config']
    )['source_url'];

    const res = await axios.head(url);

    return (res?.headers['content-length'] as number) || 0;
  };

  async load() {
    const url: string = (
      this.datasource.config as z.infer<typeof WebPageSourceSchema>['config']
    )['source_url'];

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
          custom_id: (this.datasource?.config as any)?.custom_id,
          tags: [],
        },
      }),
    ];
  }
}
