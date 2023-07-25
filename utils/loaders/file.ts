import mime from 'mime-types';

import { AppDocument, FileMetadataSchema } from '@app/types/document';
import { s3 } from '@app/utils/aws';

import excelToDocs from '../excel-to-docs';
import getS3RootDomain from '../get-s3-root-domain';
import pdfToDocs from '../pdf-to-docs';
import pptxToDocs from '../pptx-to-docs';
import wordToDocs from '../word-to-docs';

import { DatasourceLoaderBase } from './base';

export const fileBufferToDocs = async (props: {
  buffer: any;
  mimeType: string;
}) => {
  let docs: AppDocument<FileMetadataSchema>[] = [];

  switch (props.mimeType) {
    case 'text/csv':
    case 'text/plain':
    case 'application/json':
    case 'text/markdown':
      docs = [
        new AppDocument<FileMetadataSchema>({
          pageContent: new TextDecoder('utf-8').decode(props.buffer),
          metadata: {} as any,
        }),
      ];
      break;
    case 'application/pdf':
      docs = await pdfToDocs(props.buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      docs = await pptxToDocs(props.buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      docs = await wordToDocs(props.buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      docs = await excelToDocs(props.buffer);
      break;
    default:
      break;
  }

  return docs;
};

export class FileLoader extends DatasourceLoaderBase {
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load() {
    const mimeType =
      (this.datasource?.config as any)?.type ||
      (this.datasource?.config as any)?.mime_type;
    const s3Key = `datastores/${this.datasource.datastoreId}/${
      this.datasource.id
    }/${this.datasource.id}.${mime.extension(mimeType)}`;

    const res = await s3
      .getObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: s3Key,
      })
      .promise();

    const buffer = (res as any).Body.buffer;

    const docs = await fileBufferToDocs({
      buffer,
      mimeType: mimeType,
    });

    return docs.map(({ pageContent, metadata }) => ({
      pageContent,
      metadata: {
        ...metadata,
        datasource_id: this.datasource.id,
        datasource_name: this.datasource.name,
        datasource_type: this.datasource.type,
        source_url: `${getS3RootDomain()}/${s3Key}`,
        mime_type: mimeType,
        custom_id: (this.datasource?.config as any)?.custom_id,
        tags: [],
      },
    }));
  }
}
