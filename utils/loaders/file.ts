import mime from 'mime-types';

import { s3 } from '@app/utils/aws';
import { Document } from '@app/utils/datastores/base';

import excelToText from '../excel-to-text';
import pdfToText from '../pdf-to-text';
import pptxToText from '../pptx-to-text';
import wordToText from '../word-to-text';

import { DatasourceLoaderBase } from './base';

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

    let text = '';

    switch ((this.datasource.config as any).type) {
      case 'text/csv':
      case 'text/plain':
      case 'application/json':
      case 'text/markdown':
        text = (res as any).Body.toString('utf-8');
        break;
      case 'application/pdf':
        text = await pdfToText(buffer);
        break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        text = await pptxToText(buffer);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await wordToText(buffer);
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        text = await excelToText(buffer);
        break;
      default:
        break;
    }

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
