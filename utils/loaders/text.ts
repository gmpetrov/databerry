import { AppDocument } from '@app/types/document';

import { DatasourceLoaderBase } from './base';

export class TextLoader extends DatasourceLoaderBase {
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load(text: string) {
    return [
      new AppDocument({
        pageContent: text,
        metadata: {
          datastore_id: this.datasource.datastoreId!,
          datasource_id: this.datasource.id,
          datasource_name: this.datasource.name,
          datasource_type: this.datasource.type,
          source_url: (this.datasource?.config as any)?.source_url,
          custom_id: (this.datasource?.config as any)?.custom_id,
          tags: [],
        },
      }),
    ];
  }
}
