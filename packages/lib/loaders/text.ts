import { AppDocument } from '@chaindesk/lib/types/document';

import cleanTextForEmbeddings from '../clean-text-for-embeddings';
import { DatasourceText } from '../types/models';

import { DatasourceLoaderBase } from './base';

export class TextLoader extends DatasourceLoaderBase<DatasourceText> {
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load(text: string) {
    return [
      new AppDocument({
        pageContent: cleanTextForEmbeddings(text),
        metadata: {
          datastore_id: this.datasource.datastoreId!,
          datasource_id: this.datasource.id,
          datasource_name: this.datasource.name,
          datasource_type: this.datasource.type,
          source_url: this.datasource?.config?.source_url!,
          custom_id: this.datasource?.config?.custom_id,
          tags: this.datasource?.config?.tags || [],
        },
      }),
    ];
  }
}
