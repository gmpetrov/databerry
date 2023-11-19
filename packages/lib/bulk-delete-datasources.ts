import pMap from 'p-map';
import pRetry from 'p-retry';

import { prisma } from '@chaindesk/prisma/client';

import { deleteFolderFromS3Bucket } from './aws';
import { DatastoreManager } from './datastores';

const bulkDeleteDatasources = async (props: {
  datastoreId: string;
  datasourceIds: string[];
}) => {
  const datastore = await prisma.datastore.findUnique({
    where: {
      id: props.datastoreId,
    },
  });

  if (!datastore) {
    throw new Error('Datastore not found');
  }

  const deleted = await prisma.$transaction(
    async (tx) => {
      const [_, __, deleted] = await Promise.all(
        // Remove from QDrant
        [
          new DatastoreManager(datastore!).removeBulk(props.datasourceIds),

          // Remove from S3
          // TODO: how to bulk delete s3 folders
          pMap(
            props.datasourceIds,
            async (id) => {
              return deleteFolderFromS3Bucket(
                process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
                `datastores/${props.datastoreId}/${id}`
              );
            },
            {
              concurrency: 10,
            }
          ),

          // Remove from DB
          tx.appDatasource.deleteMany({
            where: {
              id: {
                in: props.datasourceIds,
              },
            },
          }),
        ]
      );

      return deleted;
    },
    {
      timeout: 1000 * 60 * 2, // 2 minutes
    }
  );

  return deleted;
};

export default bulkDeleteDatasources;
