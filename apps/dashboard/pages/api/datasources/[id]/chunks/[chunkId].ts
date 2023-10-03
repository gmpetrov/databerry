import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { DatastoreManager } from '@chaindesk/lib/datastores';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

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

  if (datasource?.organizationId !== session.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const manager = new DatastoreManager(datasource?.datastore!);

  const chunk = await manager.getChunk(chunkId);

  if (chunk?.metadata?.datasource_id !== datasourceId) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return chunk;
};

handler.get(respond(getChunk));

export default handler;
