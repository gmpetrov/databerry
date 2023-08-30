import { DatasourceType } from '@prisma/client';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { Readable } from 'stream';

import { AppDocument, FileMetadataSchema } from '@app/types/document';
import { AcceptedDatasourceMimeTypes } from '@app/types/dtos';

import { GoogleDriveManager } from '../google-drive-manager';

import { DatasourceLoaderBase } from './base';
import { fileBufferToDocs } from './file';

export const gMimeTypeFallback = {
  'application/vnd.google-apps.document':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.google-apps.presentation':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.google-apps.spreadsheet':
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
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

    const mtRes = await driveManager.drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });

    let gMimeType = mtRes?.data?.mimeType as string;
    let mimeType = null;

    let fileContents: any = null;

    const fetchStream = async (stream: Awaited<GaxiosPromise<Readable>>) => {
      return new Promise(async (resolve, reject) => {
        try {
          let data = [] as any;
          stream.data.on('data', (chunk) => data.push(chunk));
          stream.data.on('end', () => {
            let fileData = Buffer.concat(data);
            // Do something with fileData

            resolve(fileData);
          });
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    };

    switch (gMimeType) {
      case 'application/vnd.google-apps.document':
      case 'application/vnd.google-apps.presentation':
        // case 'application/vnd.google-apps.spreadsheet':
        const r = await driveManager.drive.files.export(
          {
            fileId: fileId,
            mimeType: gMimeTypeFallback[gMimeType],
          },
          {
            responseType: 'stream',
          }
        );
        mimeType = gMimeTypeFallback[gMimeType];

        fileContents = await fetchStream(r);
        break;

      default:
        const result = await driveManager.drive.files.get(
          {
            fileId: fileId,
            alt: 'media',
          },
          { responseType: 'stream' }
        );

        mimeType = result?.headers?.['content-type'];

        fileContents = await fetchStream(result);
        break;
    }

    // Get google drive url for file
    const {
      data: { webViewLink },
    } = await driveManager.drive.files.get({
      fileId: fileId,
      fields: 'webViewLink',
    });

    let docs: AppDocument[] = [];

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
            mime_type: gMimeType as string,
            custom_id: (this.datasource?.config as any)?.custom_id,
            tags: [],
          },
        })
    );
  }
}
