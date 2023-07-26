import { DatastoreVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { SearchRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createLazyAuthHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import validate from '@app/utils/validate';

const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const queryURL = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  console.log('REG BODY', req.body);
  console.log('REG QUERY', req.query);
  const session = req.session;
  const datastoreId = req.query.id as string;
  const data = req.body as SearchRequestSchema;
  const topK = data.topK || 5;

  if (!datastoreId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
    },
    include: {
      apiKeys: true,
      owner: {
        include: {
          apiKeys: true,
        },
      },
    },
  });

  if (!datastore) {
    throw new Error('Not found');
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    datastore.ownerId !== session?.user?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const store = new DatastoreManager(datastore);

  const results = await store.search({
    query: data.query,
    topK: topK as number,
    filters: data.filters,
  });

  return (results || []).map((each) => ({
    text: each.pageContent,
    score: each.metadata.score || 0,
    source: each.metadata.source_url,
    datasource_name: each.metadata.datasource_name,
    datasource_id: each.metadata.datasource_id,
  }));
};

handler.post(
  validate({
    body: SearchRequestSchema,
    handler: respond(queryURL),
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
