import { AppDatasource, DatasourceStatus, Datastore } from '@prisma/client';
import { NextApiResponse } from 'next';

import { TaskLoadDatasourceRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { s3 } from '@app/utils/aws';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import { Document } from '@app/utils/datastores/base';
import { DatasourceLoader } from '@app/utils/loaders';
import logger from '@app/utils/logger';
import prisma, {
  datasourceSelect,
  datastoreSelect,
} from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const loadDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as TaskLoadDatasourceRequestSchema;

  logger.info(`${data.datasourceId}: fetching datasource`);
  const datasource = await prisma.appDatasource.update({
    where: {
      id: data.datasourceId,
    },
    data: {
      status: DatasourceStatus.running,
    },
    select: {
      ...datasourceSelect,
      datastore: {
        select: datastoreSelect,
      },
    },
  });

  if (!datasource) {
    return res.status(404).json({ message: 'Not found' });
  }

  // If datasourceText is present update from text otherwise from source
  // const document = data.datasourceText
  //   ? new Document({
  //       pageContent: data.datasourceText,
  //       metadata: {
  //         source_type: datasource.type,
  //         source: (datasource?.config as any)?.url,
  //         datasource_id: datasource.id,
  //         tags: [],
  //       },
  //     })
  //   : await new DatasourceLoader(datasource).load(data.datasourceText);

  const document = await new DatasourceLoader(datasource as AppDatasource).load(
    data.datasourceText
  );

  const chunks = await new DatastoreManager(
    datasource.datastore as Datastore
  ).upload(document);

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
    select: {
      ...datasourceSelect,
      datastore: {
        select: datastoreSelect,
      },
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

  s3.putObject(params).promise();

  logger.info(`${data.datasourceId}: datasource runned successfully`);

  return updated;
};

handler.post(
  validate({
    body: TaskLoadDatasourceRequestSchema,
    handler: respond(loadDatasource),
  })
);

export default handler;
