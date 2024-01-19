import { s3 } from '@chaindesk/lib/aws';
import { AppDocument } from '@chaindesk/lib/types/document';
import { AppDatasource as Datasource, DatasourceType } from '@chaindesk/prisma';

import { DatasourceLoaderBase } from './base';
import { FileLoader } from './file';
import { GoogleDriveFileLoader } from './google-drive-file';
import { GoogleDriveFolderLoader } from './google-drive-folder';
import { NotionLoader } from './notion';
import { NotionPageLoader } from './notion-page';
import { QALoader } from './qa';
import { ShopifyLoader } from './shopify';
import { ShopifyCollectionLoader } from './shopify-collection';
import { ShopifyProductLoader } from './shopify-product';
import { TextLoader } from './text';
import { WebPageLoader } from './web-page';
import { WebSiteLoader } from './web-site';
import { BulkYoutubesLoader } from './youtube-bulk';
import { YoutubeVideoLoader } from './youtube-video';

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
    [DatasourceType.qa]: QALoader,
    [DatasourceType.notion_page]: NotionPageLoader,
    [DatasourceType.notion]: NotionLoader,
    [DatasourceType.youtube_video]: YoutubeVideoLoader,
    [DatasourceType.youtube_bulk]: BulkYoutubesLoader,
    [DatasourceType.shopify]: ShopifyLoader,
    [DatasourceType.shopify_collection]: ShopifyCollectionLoader,
    [DatasourceType.shopify_product]: ShopifyProductLoader,
  };

  constructor(datasource: Datasource) {
    this.datasource = datasource;
    this.manager = new this.loadersMap[this.datasource.type](
      this.datasource as any
    );
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

    return [
      new AppDocument<any>({
        pageContent: (res as any).Body.toString('utf-8'),
        metadata: {
          datasource_id: this.datasource.id,
          datasource_type: this.datasource.type,
          source_url: (this.datasource?.config as any)?.source_url,
          mime_type: (this.datasource?.config as any)?.mime_type,
          tags: (this.datasource?.config as any)?.tags || [],
        },
      }),
    ];
  }
}
