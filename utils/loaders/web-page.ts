import axios from 'axios';
import playwright from 'playwright';
import { z } from 'zod';

import { WebPageSourceSchema } from '@app/components/DatasourceForms/WebPageForm';
import type { Document } from '@app/utils/datastores/base';

import addSlashUrl from '../add-slash-url';

import { DatasourceLoaderBase } from './base';

const loadPageContent = async (url: string) => {
  const urlWithSlash = addSlashUrl(url);

  try {
    const { data } = await axios(urlWithSlash, {
      headers: {
        'User-Agent': Date.now().toString(),
      },
    });

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
    await page.goto(urlWithSlash, { waitUntil: 'networkidle' });

    const content = await page.content();

    await browser.close();

    return content;
  }
};

export class WebPageLoader extends DatasourceLoaderBase {
  getSize = async () => {
    const url: string = (
      this.datasource.config as z.infer<typeof WebPageSourceSchema>['config']
    )['source'];

    const res = await axios.head(url);

    return (res?.headers['content-length'] as number) || 0;
  };

  async load() {
    const url: string = (
      this.datasource.config as z.infer<typeof WebPageSourceSchema>['config']
    )['source'];

    const { load } = await import('cheerio');

    const content = await loadPageContent(url);
    const $ = load(content);
    $('script').remove();
    $('style').remove();
    $('link').remove();
    $('svg').remove();
    const text = $('body').text();

    return {
      pageContent: text,
      metadata: {
        source: url,
        datasource_id: this.datasource.id,
        source_type: this.datasource.type,
        tags: [],
      },
    } as Document;
  }
}
