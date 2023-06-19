import { AppDatasource as Datasource, DatasourceType } from '@prisma/client';

import { s3 } from '@app/utils/aws';
import { Document } from '@app/utils/datastores/base';

import { DatasourceLoaderBase } from './base';
import { FileLoader } from './file';
import { TextLoader } from './text';
import { WebPageLoader } from './web-page';

export class DatasourceLoader {
  datasource: Datasource;
  manager: DatasourceLoaderBase;

  loadersMap = {
    [DatasourceType.web_page]: WebPageLoader,
    [DatasourceType.web_site]: undefined as any,
    [DatasourceType.text]: TextLoader,
    // Files are converted to text in the browser.
    // Just adding this type for typescript to be happy as there is a field 'file' in the DatasourceType enum
    [DatasourceType.file]: FileLoader,
  };

  constructor(datasource: Datasource) {
    this.datasource = datasource;
    this.manager = new this.loadersMap[this.datasource.type](this.datasource);
  }

  load(file?: any) {
    return this.manager.load(file);
  }

  getSize(param?: any) {
    return this.manager.getSize(param);
  }

  async loadText() {
    const res = await s3
      .getObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: `datastores/${this.datasource.datastoreId}/${this.datasource.id}/${this.datasource.id}.txt`,
      })
      .promise();

    return new Document({
      pageContent: (res as any).Body.toString('utf-8'),
      metadata: {
        datasource_id: this.datasource.id,
        source_type: this.datasource.type,
        source: (this.datasource?.config as any)?.source,
        file_type: (this.datasource?.config as any)?.type,
        tags: [],
      },
    });
  }
}
