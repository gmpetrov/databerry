import { DatastoreVisibility } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { CreateDatastoreRequestSchema } from '@app/types/dtos';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import cuid from '@app/utils/cuid';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const getDatastores = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const datastores = await prisma.datastore.findMany({
    where: {
      ownerId: session?.user?.id,
    },
    include: {
      _count: {
        select: {
          datasources: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return datastores;
};

handler.get(respond(getDatastores));

export const createDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as CreateDatastoreRequestSchema;
  const session = req.session;

  let existingDatastore;
  if (data?.id) {
    existingDatastore = await prisma.datastore.findUnique({
      where: {
        id: data.id,
      },
    });

    if (existingDatastore?.ownerId !== session?.user?.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
  }

  const id = data?.id || cuid();

  const datastore = await prisma.datastore.upsert({
    where: {
      id,
    },
    create: {
      type: data.type,
      name: data.name || generateFunId(),
      description: data.description,
      visibility: data.isPublic
        ? DatastoreVisibility.public
        : DatastoreVisibility.private,
      owner: {
        connect: {
          id: session?.user?.id,
        },
      },
      config: {},
      apiKeys: {
        create: {
          key: uuidv4(),
        },
      },
      // config: {
      //   apiKey: process.env.QDRANT_API_KEY,
      //   apiURL: process.env.QDRANT_API_URL,
      // } as z.infer<typeof QdrantConfigSchema>,
    },
    update: {
      type: data.type,
      name: data.name,
      description: data.description,
      visibility: data.isPublic
        ? DatastoreVisibility.public
        : DatastoreVisibility.private,
      // config: data.config,
    },
  });

  return datastore;
};

handler.post(
  validate({
    body: CreateDatastoreRequestSchema,
    handler: respond(createDatastore),
  })
);

export default handler;
