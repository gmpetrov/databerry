import {
  DatasourceStatus,
  DatasourceType,
  Prisma,
  SubscriptionPlan,
  Usage,
} from '@prisma/client';

import { AppDocument } from '@app/types/document';
import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import { s3 } from '@app/utils/aws';
import { DatastoreManager } from '@app/utils/datastores';
import { DatasourceLoader } from '@app/utils/loaders';
import logger from '@app/utils/logger';
import prisma from '@app/utils/prisma-client';

import { ApiError, ApiErrorType } from './api-error';
import guardDataProcessingUsage from './guard-data-processing-usage';
import triggerTaskLoadDatasource from './trigger-task-load-datasource';

export type DatasourceExtended = Prisma.AppDatasourceGetPayload<
  typeof updateDatasourceArgs
>;

const updateDatasourceArgs = Prisma.validator<Prisma.AppDatasourceArgs>()({
  include: {
    datastore: true,
    serviceProvider: true,
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

const taskLoadDatasource = async (data: TaskLoadDatasourceRequestSchema) => {
  logger.info(`${data.datasourceId}: fetching datasource`);

  const datasource = await prisma.appDatasource.update({
    where: {
      id: data.datasourceId,
    },
    data: {
      status: DatasourceStatus.running,
    },
    ...updateDatasourceArgs,
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

  const loader = new DatasourceLoader(datasource);

  if (loader.isGroup) {
    await loader.load();

    logger.info(
      `${datasource?.id}: datasource group of type ${datasource?.type} runned successfully`
    );

    return;
  }

  let documents: AppDocument[] = [];
  try {
    documents = (
      data.isUpdateText ? await loader.loadText() : await loader.load()
    )!;
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
              sitemap: (datasource?.config as any)?.source_url,
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

  const hash = await DatastoreManager.hash(documents);

  if (hash === datasource.hash) {
    logger.info('No need to update, file has not changed');
    await prisma.appDatasource.update({
      where: {
        id: datasource.id,
      },
      data: {
        status: DatasourceStatus.synched,
      },
    });

    return;
  }

  const chunks = await new DatastoreManager(datasource.datastore!).upload(
    documents
  );

  const text = documents?.map((each) => each.pageContent)?.join('');
  const textSize = text?.length || 0;

  logger.info(`${data.datasourceId}: loading finished`);

  const updated = await prisma.appDatasource.update({
    where: {
      id: datasource.id,
    },
    data: {
      nbChunks: chunks.length,
      textSize: textSize,
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
                new TextEncoder().encode(text).length,
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
        text,
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
