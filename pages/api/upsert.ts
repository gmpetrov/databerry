import { DatastoreVisibility } from '@prisma/client';
import { NextApiResponse } from 'next';

import { SearchRequestSchema, UpsertRequestSchema } from '@app/types/dtos';
import { UpsertResponseSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import { Document } from '@app/utils/datastores/base';
import getSubdomain from '@app/utils/get-subdomain';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const upsert = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const host = req?.headers?.['host'];
  const subdomain = getSubdomain(host!);
  const data = req.body as UpsertRequestSchema;

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

  const chunks = await Promise.all(
    data.documents.map((each) => {
      return store.upload(
        new Document({
          pageContent: each.text,
          metadata: {
            datasource_id: each.metadata?.source_id!,
            tags: [],
            source_type: each.metadata?.source!,
            // TODO
            source: 'upsert',
            author: each.metadata?.author!,
          },
        })
      );
    })
  );

  return {
    ids: [],
  } as UpsertResponseSchema;
};

handler.post(
  validate({
    body: SearchRequestSchema,
    handler: respond(upsert),
  })
);

export default handler;
