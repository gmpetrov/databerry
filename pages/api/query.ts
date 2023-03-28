import { DatastoreVisibility } from '@prisma/client';
import { NextApiResponse } from 'next';

import { SearchRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const generateAiPluginJson = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const host = req?.headers?.['host'];
  const subdomain = getSubdomain(host!);
  const data = req.body as SearchRequestSchema;

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
    // return res.status(404).send('Not found');
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

  const results = await Promise.all(
    data.queries.map((each) =>
      store.search({
        query: each.query,
        topK: each.top_k || 3,
        tags: [],
      })
    )
  );

  return {
    results: results.map((each, idx) => ({
      query: data.queries[idx].query,
      results: each.map((chunk: any) => ({
        text: chunk.text,
        source: chunk.source,
        score: chunk.score,
      })),
    })),
  };
};

handler.post(
  validate({
    body: SearchRequestSchema,
    handler: respond(generateAiPluginJson),
  })
);

export default handler;
