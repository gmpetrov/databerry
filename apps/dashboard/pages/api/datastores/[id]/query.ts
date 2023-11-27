import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AnalyticsEvents, capture } from '@chaindesk/lib/analytics-server';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { DatastoreManager } from '@chaindesk/lib/datastores';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { SearchRequestSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { DatastoreVisibility } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

export const queryURL = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  req.logger.info(req.body);
  req.logger.info(req.query);

  const session = req.session;
  const datastoreId = req.query.id as string;
  const data = req.body as SearchRequestSchema;
  const topK = data.topK || 5;

  if (!datastoreId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  if (data.filters?.datastore_ids) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
    },
    include: {
      organization: {
        include: {
          memberships: {
            where: {
              role: 'OWNER',
            },
          },
        },
      },
    },
  });

  if (!datastore) {
    throw new Error('Not found');
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    datastore.organizationId !== session?.organization?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const store = new DatastoreManager(datastore);

  const results = await store.search({
    query: data.query,
    topK: topK as number,
    filters: data.filters,
  });

  capture?.({
    event: AnalyticsEvents.DATASTORE_QUERY,
    payload: {
      userId: datastore?.organization?.memberships?.[0]?.userId!,
      organizationId: session?.organization?.id,
      datastoreId: datastore.id,
    },
  });

  return (results || []).map((each) => ({
    text: each.pageContent,
    score: each.metadata.score || 0,
    source: each.metadata.source_url,
    datasource_name: each.metadata.datasource_name,
    datasource_id: each.metadata.datasource_id,
    custom_id: each.metadata.custom_id,
    offset: each.metadata.chunk_offset,
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
