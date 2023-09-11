import pMap from 'p-map';
import pRetry from 'p-retry';

import prisma from '@app/utils/prisma-client';

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

  const deleted = await prisma.$transaction(async (tx) => {
    // Remove from QDrant
    await new DatastoreManager(datastore!).removeBulk(props.datasourceIds);

    // Remove from S3
    // TODO: how to bulk delete s3 folders
    await pMap(
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
    );

    // Remove from DB
    return tx.appDatasource.deleteMany({
      where: {
        id: {
          in: props.datasourceIds,
        },
      },
    });
  });

  return deleted;
};

export default bulkDeleteDatasources;
