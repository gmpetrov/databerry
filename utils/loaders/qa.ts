import { QAConfig } from '@app/components/DatasourceForms/QAForm';
import { AppDocument } from '@app/types/document';

import { DatasourceLoaderBase } from './base';

export class QALoader extends DatasourceLoaderBase {
  // TODO: REMOVE UNUSED FUNCTION
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load() {
    const text = `${(this.datasource.config as QAConfig)?.question}\n${
      (this.datasource.config as QAConfig)?.answer
    }`;

    return [
      new AppDocument({
        pageContent: text,
        metadata: {
          datastore_id: this.datasource.datastoreId!,
          datasource_id: this.datasource.id,
          datasource_name: this.datasource.name,
          datasource_type: this.datasource.type,
          source_url: (this.datasource?.config as QAConfig)?.source_url!,
          custom_id: (this.datasource?.config as any)?.custom_id,
          tags: [],
        },
      }),
    ];
  }
}
