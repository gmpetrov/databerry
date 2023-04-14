import { DatasourceStatus } from '@prisma/client';

import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import { s3 } from '@app/utils/aws';
import { DatastoreManager } from '@app/utils/datastores';
import { DatasourceLoader } from '@app/utils/loaders';
import logger from '@app/utils/logger';
import prisma from '@app/utils/prisma-client';

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
    },
  });

  if (!datasource) {
    throw new Error('Not found');
  }

  console.log('datasource', datasource);
  const document = data.isUpdateText
    ? await new DatasourceLoader(datasource).loadText()
    : await new DatasourceLoader(datasource).load();

  console.log('document', document);
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
