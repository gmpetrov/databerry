import cuid from 'cuid';

import generateFunId from '@chaindesk/lib/generate-fun-id';
import { AppDocument } from '@chaindesk/lib/types/document';
import { DatasourceSchema } from '@chaindesk/lib/types/models';
import { DatasourceStatus, DatasourceType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

import triggerTaskLoadDatasource from '../trigger-task-load-datasource';
import YoutubeApi from '../youtube-api';

import { DatasourceLoaderBase } from './base';

type BulkYoutubeDatasource = Extract<
  DatasourceSchema,
  { type: 'youtube_bulk' }
>;

export class BulkYoutubesLoader extends DatasourceLoaderBase<BulkYoutubeDatasource> {
  isGroup = true;

  async getSize(text: string) {
    return 0;
  }

  async load() {
    const url = this.datasource.config['source_url'];

    if (!url) {
      throw new Error('Fatal: missing or invalid url');
    }

    const Youtube = new YoutubeApi();
    const name = await Youtube.getYoutubeDatasourceName(
      (this.datasource?.config as any)?.source_url
    );

    const type = YoutubeApi.getYoutubeLinkType(url);

    let videos: { id: string; title: string }[] = [];

    switch (type) {
      case 'channel':
        videos = await Youtube.getVideosForChannel(url);
        break;
      case 'playlist':
        videos = await Youtube.getVideosForPlaylist(url);
        break;
      case 'unknown':
        throw new Error('Invalid youtube Url');
    }

    await prisma.$transaction(async (tx) => {
      let ids: string[] = videos.map(() => cuid());

      await tx.appDatasource.createMany({
        data: videos.map((video, index) => ({
          id: ids[index],
          type: DatasourceType.youtube_video,
          name: video?.title || `${generateFunId()}`,
          config: {
            source_url: `https://www.youtube.com/watch?v=${video?.id}`,
          },
          organizationId: this.datasource?.organizationId!,
          datastoreId: this.datasource?.datastoreId,
          groupId: this.datasource?.id,
          serviceProviderId: this.datasource?.serviceProviderId,
        })),
        skipDuplicates: true,
      });

      await tx.appDatasource.update({
        where: {
          id: this.datasource.id,
        },
        data: {
          name,
          status: DatasourceStatus.synched,
        },
      });

      await triggerTaskLoadDatasource(
        videos.map((_, index) => ({
          organizationId: this.datasource?.organizationId!,
          datasourceId: ids[index],
          priority: 10,
        }))
      );
    });

    return [] as AppDocument[];
  }
}
