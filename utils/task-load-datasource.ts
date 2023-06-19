import {
  DatasourceStatus,
  DatasourceType,
  SubscriptionPlan,
  Usage,
} from '@prisma/client';

import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import accountConfig from '@app/utils/account-config';
import { s3 } from '@app/utils/aws';
import { DatastoreManager } from '@app/utils/datastores';
import type { Document } from '@app/utils/datastores/base';
import { DatasourceLoader } from '@app/utils/loaders';
import logger from '@app/utils/logger';
import prisma from '@app/utils/prisma-client';

import { ApiError, ApiErrorType } from './api-error';
import cuid from './cuid';
import findDomainPages, { getSitemapPages } from './find-domain-pages';
import findSitemap from './find-sitemap';
import guardDataProcessingUsage from './guard-data-processing-usage';
import triggerTaskLoadDatasource from './trigger-task-load-datasource';

const taskLoadDatasource = async (data: TaskLoadDatasourceRequestSchema) => {
  logger.info(`${data.datasourceId}: fetching datasource`);

  const datasource = await prisma.appDatasource.update({
    where: {
      id: data.datasourceId,
    },
    data: {
      status: DatasourceStatus.running,
    },
    include: {
      datastore: true,
      owner: {
        include: {
          usage: true,
          subscriptions: {
            where: {
              status: 'active',
            },
          },
        },
      },
    },
  });

  if (!datasource) {
    throw new Error('Not found');
  }

  const currentPlan =
    datasource?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0;

  try {
    guardDataProcessingUsage({
      usage: datasource?.owner?.usage as Usage,
      plan: currentPlan,
    });
  } catch {
    logger.info(`${data.datasourceId}: usage limit reached`);

    await prisma.appDatasource.update({
      where: {
        id: datasource.id,
      },
      data: {
        status: DatasourceStatus.usage_limit_reached,
      },
    });
    return;
  }

  // TODO: find a better way to handle this
  if (datasource.type === DatasourceType.web_site) {
    let urls: string[] = [];
    let nestedSitemaps: string[] = [];
    const sitemap = (datasource.config as any).sitemap;
    const source = (datasource.config as any).source;

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
        urls = await findDomainPages(source);
      }
    } else {
      return;
    }

    urls = urls.slice(
      0,
      accountConfig[currentPlan]?.limits?.maxWebsiteURL || 10
    );

    const ids = urls.map(() => cuid());
    const idsSitemaps = nestedSitemaps.map(() => cuid());

    if (ids.length > 0) {
      await prisma.appDatasource.createMany({
        data: urls.map((each, idx) => ({
          id: ids[idx],
          type: DatasourceType.web_page,
          name: each,
          config: {
            ...(datasource.config as any),
            source: each,
          },
          ownerId: datasource?.ownerId,
          datastoreId: datasource?.datastoreId,
        })),
      });
    }

    if (idsSitemaps.length > 0) {
      await prisma.appDatasource.createMany({
        data: nestedSitemaps.map((each, idx) => ({
          id: idsSitemaps[idx],
          type: DatasourceType.web_site,
          name: each,
          config: {
            ...(datasource.config as any),
            sitemap: each,
          },
          ownerId: datasource?.ownerId,
          datastoreId: datasource?.datastoreId,
        })),
      });
    }

    await triggerTaskLoadDatasource(
      [...ids, ...idsSitemaps].map((each) => ({
        userId: datasource?.ownerId!,
        datasourceId: each,
        priority: 10,
      }))
    );

    await prisma.appDatasource.delete({
      where: {
        id: datasource.id,
      },
    });

    logger.info(
      `${datasource?.id}: datasource of type ${datasource?.type} runned successfully`
    );

    return;
  }

  console.log('datasource', datasource);
  let document: Document;

  try {
    document = data.isUpdateText
      ? await new DatasourceLoader(datasource).loadText()
      : await new DatasourceLoader(datasource).load();
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.name === ApiErrorType.WEBPAGE_IS_SITEMAP) {
        console.log(
          'ApiErrorType.WEBPAGE_IS_SITEMAP',
          ApiErrorType.WEBPAGE_IS_SITEMAP
        );

        // WebPage is a sitemap re-run as a sitemap
        await prisma.appDatasource.update({
          where: {
            id: datasource.id,
          },
          data: {
            type: DatasourceType.web_site,
            status: DatasourceStatus.unsynched,
            config: {
              ...(datasource.config as any),
              sitemap: (datasource?.config as any)?.source,
            },
          },
        });

        //
        await triggerTaskLoadDatasource([
          {
            userId: datasource.ownerId!,
            datasourceId: datasource.id,
            priority: 2,
          },
        ]);
        return;
      }
    }
    throw err;
  }

  // console.log('document', document);
  const chunks = await new DatastoreManager(datasource.datastore!).upload(
    document
  );

  const hash = chunks?.[0]?.metadata?.datasource_hash as string;

  logger.info(`${data.datasourceId}: loading finished`);

  const updated = await prisma.appDatasource.update({
    where: {
      id: datasource.id,
    },
    data: {
      nbChunks: chunks.length,
      textSize: document?.pageContent?.length || 0,
      status: DatasourceStatus.synched,
      lastSynch: new Date(),
      nbSynch: datasource?.nbSynch! + 1,
      hash,
      // Update usage
      owner: {
        update: {
          usage: {
            update: {
              nbDataProcessingBytes:
                (datasource?.owner?.usage?.nbDataProcessingBytes || 0) +
                new TextEncoder().encode(document?.pageContent).length,
            },
          },
        },
      },
    },
    include: {
      datastore: true,
    },
  });

  // Add to S3
  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: `datastores/${datasource.datastore?.id}/${datasource.id}/data.json`,
    Body: Buffer.from(
      JSON.stringify({
        hash,
        text: document.pageContent,
      })
    ),
    CacheControl: 'no-cache',
    ContentType: 'application/json',
    ACL: 'public-read',
  };

  await s3.putObject(params).promise();

  logger.info(`${data.datasourceId}: datasource runned successfully`);
};

export default taskLoadDatasource;
