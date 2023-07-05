import mime from 'mime-types';

import { s3 } from '@app/utils/aws';
import { Document } from '@app/utils/datastores/base';

import excelToText from '../excel-to-text';
import pdfToText from '../pdf-to-text';
import pptxToText from '../pptx-to-text';
import wordToText from '../word-to-text';

import { DatasourceLoaderBase } from './base';

export const fileBufferToString = async (props: {
  buffer: any;
  mimeType: string;
}) => {
  let text = '';

  switch (props.mimeType) {
    case 'text/csv':
    case 'text/plain':
    case 'application/json':
    case 'text/markdown':
      text = new TextDecoder('utf-8').decode(props.buffer);
      break;
    case 'application/pdf':
      text = await pdfToText(props.buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      text = await pptxToText(props.buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      text = await wordToText(props.buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      text = await excelToText(props.buffer);
      break;
    default:
      break;
  }

  return text;
};

export class FileLoader extends DatasourceLoaderBase {
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load() {
    const res = await s3
      .getObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: `datastores/${this.datasource.datastoreId}/${this.datasource.id}/${
          this.datasource.id
        }.${mime.extension((this.datasource?.config as any)?.type)}`,
      })
      .promise();

    const buffer = (res as any).Body.buffer;

    const text = await fileBufferToString({
      buffer,
      mimeType: (this.datasource?.config as any)?.type,
    });

    return new Document({
      pageContent: text,
      metadata: {
        datasource_id: this.datasource.id,
        source_type: this.datasource.type,
        source: (this.datasource?.config as any)?.source,
        file_type: (this.datasource?.config as any)?.type,
        custom_id: (this.datasource?.config as any)?.custom_id,
        tags: [],
      },
    });
  }
}
