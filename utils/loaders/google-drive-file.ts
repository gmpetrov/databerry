import { DatasourceType } from '@prisma/client';

import { AppDocument, FileMetadataSchema } from '@app/types/document';
import { AcceptedDatasourceMimeTypes } from '@app/types/dtos';

import { GoogleDriveManager } from '../google-drive-manager';

import { DatasourceLoaderBase } from './base';
import { fileBufferToDocs } from './file';

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

    // Get google drive url for file
    const {
      data: { webViewLink },
    } = await driveManager.drive.files.get({
      fileId: fileId,
      fields: 'webViewLink',
    });

    let docs: AppDocument[] = [];
    const mimeType = result?.headers?.['content-type'];

    if (AcceptedDatasourceMimeTypes.includes(mimeType!)) {
      docs = await fileBufferToDocs({
        buffer: fileContents,
        mimeType,
      });
    }

    return docs.map(
      (each) =>
        new AppDocument<FileMetadataSchema>({
          ...each,
          metadata: {
            ...each.metadata,
            datastore_id: this.datasource.datastoreId!,
            datasource_id: this.datasource.id,
            datasource_name: this.datasource.name,
            datasource_type: this.datasource.type as 'google_drive_file',
            source_url: webViewLink as string,
            mime_type: mimeType,
            tags: [],
          },
        })
    );
  }
}
