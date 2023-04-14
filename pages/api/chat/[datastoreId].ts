import { DatastoreVisibility } from '@prisma/client';
import { NextApiResponse } from 'next';

import { ChatRequest } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import chat from '@app/utils/chat';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

export const chatHandler = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const datastoreId = req.query.datastoreId as string;
  const data = req.body as ChatRequest;

  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')?.[1];

  if (!datastoreId) {
    return res.status(400).send('Missing subdomain');
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: datastoreId,
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

  return chat({
    datastore,
    query: data.query,
    topK: 6,
  });
};

handler.post(
  validate({
    body: ChatRequest,
    handler: respond(chatHandler),
  })
);

export default handler;
