import cuid from 'cuid';

import { AppDocument } from '@chaindesk/lib/types/document';
import {
  DatasourceStatus,
  DatasourceType,
  SubscriptionPlan,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

import accountConfig from '../account-config';
import bulkDeleteDatasources from '../bulk-delete-datasources';
import findDomainPages, { getSitemapPages } from '../find-domain-pages';
import findSitemap from '../find-sitemap';
import isUrlBlocked from '../isUrlBlocked';
import triggerTaskLoadDatasource from '../trigger-task-load-datasource';
import { DatasourceWebSite } from '../types/models';

import { DatasourceLoaderBase } from './base';

export class WebSiteLoader extends DatasourceLoaderBase<DatasourceWebSite> {
  isGroup = true;

  getSize = async () => {
    return 0;
  };

  async load() {
    let urls: string[] = [];
    let nestedSitemaps: string[] = [];
    const sitemap = this.datasource.config.sitemap;
    const source = this.datasource.config.source_url;
    const blackListedUrls = this.datasource.config?.black_listed_urls;

    const currentPlan =
      this.datasource?.organization?.subscriptions?.[0]?.plan ||
      SubscriptionPlan.level_0;

    const maxPages = accountConfig[currentPlan]?.limits?.maxWebsiteURL || 25;

    if (sitemap) {
      const { pages, sitemaps } = await getSitemapPages(sitemap, maxPages);
      urls = pages;
      nestedSitemaps = sitemaps;
    } else if (source) {
      // Try to find sitemap
      const sitemapURL = await findSitemap(source);

      if (sitemapURL) {
        const { pages, sitemaps } = await getSitemapPages(sitemapURL, maxPages);
        urls = pages;
        nestedSitemaps = sitemaps;
      } else {
        // Fallback to recursive search
        urls = await findDomainPages(source, maxPages);
      }
    } else {
      urls = [];
    }

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

    const cleanUrls: string[] = blackListedUrls
      ? urls?.filter((url) => !isUrlBlocked(url, blackListedUrls))
      : urls;

    const ids = cleanUrls.map((u) => {
      const found = children.find(
        (each) => (each as any)?.config?.source_url === u
      );

      if (found) {
        return found.id;
      }

      return cuid();
    });

    const childrenIdsToDelete =
      children
        ?.filter(
          (each) => !cleanUrls?.includes((each as any)?.config?.source_url)
        )
        ?.map((each) => each.id) || [];

    if (childrenIdsToDelete?.length > 0) {
      await bulkDeleteDatasources({
        datastoreId: this.datasource.datastoreId!,
        datasourceIds: childrenIdsToDelete,
      });
    }

    if (ids.length > 0) {
      await prisma.appDatasource.createMany({
        data: cleanUrls.map((each, idx) => ({
          id: ids[idx],
          type: DatasourceType.web_page,
          name: each,
          config: {
            ...(this.datasource.config as any),
            source_url: each,
          },
          organizationId: this.datasource?.organizationId,
          datastoreId: this.datasource?.datastoreId,
          groupId,
        })),
        skipDuplicates: true,
      });
    }

    const idsSitemaps = nestedSitemaps.map(() => cuid());
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
          organizationId: this.datasource?.organizationId,
          datastoreId: this.datasource?.datastoreId,
          groupId,
        })),
      });
    }

    await triggerTaskLoadDatasource(
      [...ids, ...idsSitemaps].map((each) => ({
        organizationId: this.datasource?.organizationId!,
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
