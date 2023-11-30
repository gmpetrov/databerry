import axios from 'axios';

import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceSchema } from '@chaindesk/lib/types/models';

import { ModelConfig } from '../config';
import countTokens from '../count-tokens';
import timeCodeToSeconds from '../timeCodeToSeconds';
import YoutubeApi from '../youtube-api';
import ytSummarize from '../youtubeSummarizer';

import { DatasourceLoaderBase } from './base';

type DatasourceYoutubeVideo = Extract<
  DatasourceSchema,
  { type: 'youtube_video' }
>;
const maxTokens = ModelConfig.gpt_3_5_turbo.maxTokens * 0.7;

export class YoutubeVideoLoader extends DatasourceLoaderBase<DatasourceYoutubeVideo> {
  async getSize(text: string) {
    return 0;
  }

  async load() {
    const url = this.datasource.config['source_url'];

    if (!url) {
      throw new Error('Fatal: missing youtube url.');
    }

    let docs = [] as AppDocument[];
    try {
      const { chapters, thematics } = await ytSummarize(url);

      chapters.map(({ summary, startTimecode }) => {
        docs.push(
          new AppDocument<any>({
            pageContent: summary,
            metadata: {
              source_url: `${url}&t=${timeCodeToSeconds(startTimecode)}`,
              tags: thematics,
            },
          })
        );
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
        },
      };
    });
  }
}
