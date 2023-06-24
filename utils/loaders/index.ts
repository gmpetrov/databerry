import { AppDatasource as Datasource, DatasourceType } from '@prisma/client';

import { s3 } from '@app/utils/aws';
import { Document } from '@app/utils/datastores/base';

import { DatasourceLoaderBase } from './base';
import { FileLoader } from './file';
import { GoogleDriveFileLoader } from './google-drive-file';
import { GoogleDriveFolderLoader } from './google-drive-folder';
import { TextLoader } from './text';
import { WebPageLoader } from './web-page';
import { WebSiteLoader } from './web-site';

export class DatasourceLoader {
  datasource: Datasource;
  manager: DatasourceLoaderBase;
  isGroup?: boolean;

  loadersMap = {
    [DatasourceType.web_page]: WebPageLoader,
    [DatasourceType.web_site]: WebSiteLoader,
    [DatasourceType.text]: TextLoader,
    // Files are converted to text in the browser.
    // Just adding this type for typescript to be happy as there is a field 'file' in the DatasourceType enum
    [DatasourceType.file]: FileLoader,
    [DatasourceType.google_drive_file]: GoogleDriveFileLoader,
    [DatasourceType.google_drive_folder]: GoogleDriveFolderLoader,
    [DatasourceType.notion]: undefined as any,
  };

  constructor(datasource: Datasource) {
    this.datasource = datasource;
    this.manager = new this.loadersMap[this.datasource.type](this.datasource);
    this.isGroup = this.manager.isGroup;
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
