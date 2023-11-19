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

  await new DatastoreManager(datastore!).removeBulk(props.datasourceIds);

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

  const deleted = await prisma.appDatasource.deleteMany({
    where: {
      id: {
        in: props.datasourceIds,
      },
    },
  });

  return deleted;
};

export default bulkDeleteDatasources;
