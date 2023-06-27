import { AcceptedDatasourceMimeTypes } from '@app/types/dtos';
import { Document } from '@app/utils/datastores/base';

import { GoogleDriveManager } from '../google-drive-manager';

import { DatasourceLoaderBase } from './base';
import { fileBufferToString } from './file';

export class GoogleDriveFileLoader extends DatasourceLoaderBase {
  async getSize(text: string) {
    // return new Blob([text]).size;
    return 0;
  }

  async load() {
    const driveManager = new GoogleDriveManager({
      accessToken: this.datasource?.serviceProvider?.accessToken!,
      refreshToken: this.datasource?.serviceProvider?.refreshToken!,
    });

    await driveManager.refreshAuth();

    const fileId = (this.datasource as any)?.config?.objectId as string;
    const type = (this.datasource as any)?.config?.type as string;

    const result = await driveManager.drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    );

    const p = new Promise(async (resolve, reject) => {
      try {
        let data = [] as any;
        result.data.on('data', (chunk) => data.push(chunk));
        result.data.on('end', () => {
          let fileData = Buffer.concat(data);
          // Do something with fileData

          resolve(fileData);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });

    const fileContents = await p;

    let text = '';
    const mimeType = result?.headers?.['content-type'];

    if (AcceptedDatasourceMimeTypes.includes(mimeType!)) {
      text = await fileBufferToString({
        buffer: fileContents,
        mimeType,
      });
    }

    return new Document({
      pageContent: text,
      metadata: {
        datasource_id: this.datasource.id,
        source_type: this.datasource.type,
        source: (this.datasource?.config as any)?.source,
        file_type: mimeType,
        tags: [],
      },
    });
  }
}
