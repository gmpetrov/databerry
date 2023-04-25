import {
  DatasourceStatus,
  DatasourceType,
  SubscriptionPlan,
  Usage,
} from '@prisma/client';

import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import { s3 } from '@app/utils/aws';
import { DatastoreManager } from '@app/utils/datastores';
import { DatasourceLoader } from '@app/utils/loaders';
import logger from '@app/utils/logger';
import prisma from '@app/utils/prisma-client';

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

  try {
    guardDataProcessingUsage({
      usage: datasource?.owner?.usage as Usage,
      plan:
        datasource?.owner?.subscriptions?.[0]?.plan || SubscriptionPlan.level_0,
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
    const sitemap = (datasource.config as any).sitemap;
    const source = (datasource.config as any).source;

    if (sitemap) {
      urls = await getSitemapPages(sitemap);
    } else if (source) {
      // Try to find sitemap
      const sitemapURL = await findSitemap(source);

      if (sitemapURL) {
        console.log('CALLLED--------->', sitemapURL);
        urls = await getSitemapPages(sitemapURL);
        console.log('END--------->', urls);
      } else {
        // Fallback to recursive search
        urls = await findDomainPages((data as any).config.source);
      }
    } else {
      return;
    }

    // urls = urls.slice(0, 10);

    console.log('CALLED 2222');
    const ids = urls.map(() => cuid());
    console.log('CALLED 33333');

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
    console.log('CALLED 33333');

    await triggerTaskLoadDatasource(
      ids.map((each) => ({
        datasourceId: each,
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
  const document = data.isUpdateText
    ? await new DatasourceLoader(datasource).loadText()
    : await new DatasourceLoader(datasource).load();

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
    Key: `datastores/${datasource.datastore?.id}/${datasource.id}.json`,
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
