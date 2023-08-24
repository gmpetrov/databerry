import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getChunk = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const datasourceId = req.query.id as string;
  const chunkId = req.query.chunkId as string;

  const datasource = await prisma.appDatasource.findUnique({
    where: {
      id: datasourceId,
    },
    include: {
      datastore: true,
    },
  });

  if (datasource?.ownerId !== session.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const manager = new DatastoreManager(datasource.datastore!);

  const chunk = await manager.getChunk(chunkId);

  if (chunk?.metadata?.datasource_id !== datasourceId) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return chunk;
};

handler.get(respond(getChunk));

export default handler;
