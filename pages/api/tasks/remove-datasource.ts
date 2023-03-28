import { Datastore } from '@prisma/client';
import { NextApiResponse } from 'next';

import { TaskRemoveDatasourceRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { s3 } from '@app/utils/aws';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma, { datastoreSelect } from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const removeDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as TaskRemoveDatasourceRequestSchema;

  console.info(`${data.datastoreId}: fetching datasource`);
  const datastore = await prisma.datastore.findUnique({
    where: {
      id: data.datastoreId,
    },
    select: datastoreSelect,
  });

  if (!datastore) {
    return res.status(404).json({ message: 'Not found' });
  }

  await new DatastoreManager(datastore as Datastore).remove(data.datasourceId);

  s3.deleteObjects({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Delete: {
      Objects: [
        {
          Key: `datastores/${datastore.id}/${data.datasourceId}.json`,
        },
      ],
    },
  }).promise();

  return { success: true };
};

handler.post(
  validate({
    body: TaskRemoveDatasourceRequestSchema,
    handler: respond(removeDatasource),
  })
);

export default handler;
