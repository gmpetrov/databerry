import axios from 'axios';
import { z } from 'zod';

import { WebPageSourceSchema } from '@app/components/DatasourceForms/WebPageForm';
import type { Document } from '@app/utils/datastores/base';

import { DatasourceLoaderBase } from './base';

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

    const res = await axios(url);
    const $ = load(res.data);
    $('script').remove();
    $('style').remove();
    $('link').remove();
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
