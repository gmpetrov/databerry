import mime from 'mime-types';
import { Readable } from 'stream';

import audioToDocs from '../audio-to-docs';
import { s3 } from '../aws';
import excelToDocs from '../excel-to-docs';
import pdfToDocs from '../pdf-to-docs';
import pptxToDocs from '../pptx-to-docs';
import { AppDocument, FileMetadataSchema } from '../types/document';
import { DatasourceFile } from '../types/models';
import wordToDocs from '../word-to-docs';

import { DatasourceLoaderBase } from './base';

const audioMimeTypes = [
  // Audio File Types
  'audio/aac',
  'audio/midi',
  'audio/x-midi',
  'audio/mpeg',
  'audio/ogg',
  'audio/opus',
  'audio/wav',
  'audio/webm',
  'audio/3gpp',
  'audio/3gpp2',
  'audio/mp4',
];

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
    case 'audio/mpeg':
    case 'audio/wav':
    case 'audio/ogg':
    case 'audio/aac':
    case 'audio/midi':
    case 'audio/flac':
    case 'audio/x-ms-wma':
      docs = await audioToDocs({ buffer: props.buffer });
      break;
    default:
      break;
  }

  return docs;
};

// used for large audio/video files
const fileStreamToDocs = async (props: {
  mimeType: string;
  stream: Readable;
  duration: number;
}) => {
  let docs: AppDocument<FileMetadataSchema>[] = [];

  switch (props.mimeType) {
    case 'audio/mpeg':
    case 'audio/wav':
    case 'audio/ogg':
    case 'audio/aac':
    case 'audio/midi':
    case 'audio/flac':
    case 'audio/x-ms-wma':
      docs = await audioToDocs({
        readableStream: props.stream,
        duration: props.duration,
      });
      break;
    default:
      break;
  }

  return docs;
};

export class FileLoader extends DatasourceLoaderBase<DatasourceFile> {
  async getSize(text: string) {
    return new Blob([text]).size;
  }

  async load() {
    const mimeType =
      (this.datasource?.config as any)?.type ||
      this.datasource?.config?.mime_type;
    const s3Key = `datastores/${this.datasource.datastoreId}/${
      this.datasource.id
    }/${this.datasource.id}.${mime.extension(mimeType)}`;

    let docs: AppDocument<any>[] = [];

    // stream large video/audio, buffer otherwise.

    if (
      audioMimeTypes.includes(mimeType) &&
      (this.datasource.config as any).fileDuration > 10
    ) {
      const res = s3
        .getObject({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
          Key: s3Key,
        })
        .createReadStream();

      docs = await fileStreamToDocs({
        stream: res,
        duration: (this.datasource.config as any).fileDuration,
        mimeType,
      });
    } else {
      const res = await s3
        .getObject({
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
          Key: s3Key,
        })
        .promise();

      const buffer = (res as any).Body.buffer;
      docs = await fileBufferToDocs({
        buffer,
        mimeType: mimeType,
      });
    }

    return docs.map(({ pageContent, metadata }) => ({
      pageContent,
      metadata: {
        ...metadata,
        datasource_id: this.datasource.id,
        datasource_name: this.datasource.name,
        datasource_type: this.datasource.type,
        mime_type: mimeType,
        source_url: this.datasource.config?.source_url!,
        custom_id: this.datasource?.config?.custom_id!,
        tags: this.datasource?.config?.tags || [],
      },
    }));
  }
}
