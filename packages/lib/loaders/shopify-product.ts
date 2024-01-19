import { NotionToolset } from '@chaindesk/lib/notion-helpers';
import { DatasourceExtended } from '@chaindesk/lib/task-load-datasource';
import { AppDocument } from '@chaindesk/lib/types/document';

import { DatasourceShopifyProduct } from '../types/models';

import { DatasourceLoaderBase } from './base';
import { getTextFromHTML } from './web-page';

export class ShopifyProductLoader extends DatasourceLoaderBase<DatasourceShopifyProduct> {
  constructor(datasource: DatasourceExtended<DatasourceShopifyProduct>) {
    super(datasource);
  }

  async getSize(text: string) {
    return 0;
  }

  async load() {
    const cleanDescription = await getTextFromHTML(
      this.datasource.config.description
    );
    const pageContent = `product title: ${this.datasource.config.title} \n description: ${cleanDescription}`;
    try {
      return [
        new AppDocument({
          pageContent: pageContent || '',
          metadata: {
            datastore_id: this.datasource.datastoreId!,
            datasource_id: this.datasource.id,
            datasource_name: this.datasource.name,
            datasource_type: this.datasource.type,
            tags: this.datasource?.config?.tags || [],
            source_url: '',
          },
        }),
      ];
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
