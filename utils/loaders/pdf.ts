import { Document } from '@app/utils/datastores/base';

import { DatasourceLoaderBase } from './base';

export class PdfLoader extends DatasourceLoaderBase {
  async load(file?: any) {
    // TODO

    return new Document({
      pageContent: '',
      metadata: {
        datasource_id: this.datasource.id,
        source_type: this.datasource.type,
        tags: [],
      },
    });
  }
}
