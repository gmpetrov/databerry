import {
  DatasourceStatus,
  DatasourceType,
  SubscriptionPlan,
} from '@prisma/client';

import { AppDocument } from '@app/types/document';
import prisma from '@app/utils/prisma-client';

import accountConfig from '../account-config';
import cuid from '../cuid';
import findDomainPages, { getSitemapPages } from '../find-domain-pages';
import findSitemap from '../find-sitemap';
import triggerTaskLoadDatasource from '../trigger-task-load-datasource';

import { DatasourceLoaderBase } from './base';

export class WebSiteLoader extends DatasourceLoaderBase {
  isGroup = true;

  getSize = async () => {
    return 0;
  };

  async load() {
    let urls: string[] = [];
    let nestedSitemaps: string[] = [];
    const sitemap = (this.datasource.config as any).sitemap;
    const source = (this.datasource.config as any).source_url;
    const currentPlan =
      this.datasource?.owner?.subscriptions?.[0]?.plan ||
      SubscriptionPlan.level_0;

    const maxAutoPages =
      accountConfig[currentPlan]?.limits?.maxWebsiteURL || 25;

    if (sitemap) {
      const { pages, sitemaps } = await getSitemapPages(sitemap);
      urls = pages;
      nestedSitemaps = sitemaps;
    } else if (source) {
      // Try to find sitemap
      const sitemapURL = await findSitemap(source);

      if (sitemapURL) {
        const { pages, sitemaps } = await getSitemapPages(sitemapURL);
        urls = pages;
        nestedSitemaps = sitemaps;
      } else {
        // Fallback to recursive search
        urls = await findDomainPages(source, maxAutoPages);
      }
    } else {
      urls = [];
    }

    urls = urls.slice(
      0,
      accountConfig[currentPlan]?.limits?.maxWebsiteURL || 10
    );

    const groupId = this.datasource?.groupId || this.datasource?.id;
    const children = await prisma.appDatasource.findMany({
      where: {
        groupId,
      },
      select: {
        id: true,
        config: true,
      },
    });

    const ids = urls.map((u) => {
      const found = children.find(
        (each) => (each as any)?.config?.source_url === u
      );

      if (found) {
        return found.id;
      }

      return cuid();
    });
    const idsSitemaps = nestedSitemaps.map(() => cuid());

    if (ids.length > 0) {
      await prisma.appDatasource.createMany({
        data: urls.map((each, idx) => ({
          id: ids[idx],
          type: DatasourceType.web_page,
          name: each,
          config: {
            ...(this.datasource.config as any),
            source_url: each,
          },
          ownerId: this.datasource?.ownerId,
          datastoreId: this.datasource?.datastoreId,
          groupId,
        })),
        skipDuplicates: true,
      });
    }

    if (idsSitemaps.length > 0) {
      await prisma.appDatasource.createMany({
        data: nestedSitemaps.map((each, idx) => ({
          id: idsSitemaps[idx],
          type: DatasourceType.web_site,
          name: each,
          config: {
            ...(this.datasource.config as any),
            sitemap: each,
          },
          ownerId: this.datasource?.ownerId,
          datastoreId: this.datasource?.datastoreId,
          groupId,
        })),
      });
    }

    await triggerTaskLoadDatasource(
      [...ids, ...idsSitemaps].map((each) => ({
        userId: this.datasource?.ownerId!,
        datasourceId: each,
        priority: 10,
      }))
    );

    if (this.datasource?.groupId) {
      // already part of a group, remove this group
      await prisma.appDatasource.delete({
        where: {
          id: this.datasource.id,
        },
      });
    } else {
      await prisma.appDatasource.update({
        where: {
          id: this.datasource.id,
        },
        data: {
          status: DatasourceStatus.synched,
        },
      });
    }

    return [] as AppDocument[];
  }
}
