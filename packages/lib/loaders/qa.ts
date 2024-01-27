import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceQA, QAConfig } from '@chaindesk/lib/types/models';

import { DatasourceLoaderBase } from './base';

export class QALoader extends DatasourceLoaderBase<DatasourceQA> {
  // TODO: REMOVE UNUSED FUNCTION
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load() {
    const text = `QUESTION: """${this.datasource.config?.question}"""\nANSWER: """${this.datasource.config?.answer}"""`;

    return [
      new AppDocument({
        pageContent: text,
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
