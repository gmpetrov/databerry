import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';

import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceSchema } from '@chaindesk/lib/types/models';

import { ApiError, ApiErrorType } from '../api-error';
import cleanTextForEmbeddings from '../clean-text-for-embeddings';

import { DatasourceLoaderBase } from './base';

type DatasourceYoutubeVideo = Extract<
  DatasourceSchema,
  { type: 'youtube_video' }
>;

type YoutubeTranscriptType = { text: string; duration: number; offset: number };

export class YoutubeVideoLoader extends DatasourceLoaderBase<DatasourceYoutubeVideo> {
  async getSize(text: string) {
    return 0;
  }

  async load() {
    const url = this.datasource.config['source_url'];

    if (!url) {
      throw new Error('Fatal: missing youtube url.');
    }

    let docs = [];
    try {
      const transcripts: YoutubeTranscriptType[] =
        await YoutubeTranscript.fetchTranscript(url);
      docs = transcripts.map(({ text, offset }) => {
        return new AppDocument<any>({
          pageContent: text,
          metadata: {
            source_url: `${url}&t=${Math.ceil(offset / 1000)}`,
          },
        });
      });
    } catch (err) {
      docs = [
        new AppDocument<any>({
          pageContent: 'FAILED: Captions Are Disabled on this Video.',
          metadata: {
            source_url: url,
          },
        }),
      ];
    }

    return docs.map(({ pageContent, metadata }) => {
      return {
        pageContent,
        metadata: {
          ...metadata,
          datastore_id: this.datasource.datastoreId!,
          datasource_id: this.datasource.id,
          datasource_name: this.datasource.name,
          datasource_type: this.datasource.type,
          custom_id: this.datasource?.config?.custom_id,
          tags: this.datasource?.config?.tags || [],
        },
      };
    });
  }
}
