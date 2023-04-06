import { DatastoreVisibility } from '@prisma/client';
import { NextApiResponse } from 'next';

import { SearchSimpleRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const queryURL = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  console.log('REG BODY', req.body);
  console.log('REG QUERY', req.query);
  const host = req?.headers?.['host'];
  const subdomain = getSubdomain(host!);
  const data = req.body as SearchSimpleRequestSchema;
  const topK = parseInt((req as any).query.topK || 3);

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!subdomain) {
    return res.status(400).send('Missing subdomain');
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: subdomain,
    },
    include: {
      apiKeys: true,
    },
  });

  if (!datastore) {
    throw new Error('Not found');
  }

  if (
    datastore.visibility === DatastoreVisibility.private &&
    (!token || !datastore.apiKeys.find((each) => each.key === token))
  ) {
    // return res.status(403).send('Unauthorized');
    throw new Error('Unauthorized');
  }

  const store = new DatastoreManager(datastore);

  const results = await store.search({
    query: data.query,
    topK: topK as number,
    tags: [],
  });

  return {
    results,
  };
};

handler.post(
  validate({
    body: SearchSimpleRequestSchema,
    handler: respond(queryURL),
  })
);

export default handler;
