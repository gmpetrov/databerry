import { DatastoreVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { CreateDatastoreRequestSchema } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import cuid from '@app/utils/cuid';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import uuidv4 from '@app/utils/uuid';
import validate from '@app/utils/validate';

const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
});

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
    take: 100,
  });

  return datastores;
};

handler.get(respond(getDatastores));

export const createDatastore = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  let data = req.body as CreateDatastoreRequestSchema;
  const session = req.session;

  let existingDatastore;
  if (data?.id) {
    existingDatastore = await prisma.datastore.findUnique({
      where: {
        id: data.id,
      },
    });

    if (existingDatastore?.ownerId !== session?.user?.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }

    data = {
      ...existingDatastore,
      ...data,
    } as CreateDatastoreRequestSchema;
  }

  const id = data?.id || cuid();
  const name = data.name || generateFunId();

  const datastore = await prisma.datastore.upsert({
    where: {
      id,
    },
    create: {
      type: data.type,
      name,
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
      pluginName: data.pluginName || name?.substring(0, 20),
      pluginDescriptionForHumans: `About ${
        data.pluginDescriptionForHumans || name?.substring(0, 90)
      }`,
      pluginDescriptionForModel: `Plugin for searching informations about ${name} to find answers to questions and retrieve relevant information. Use it whenever a user asks something that might be related to ${name}.`,
    },
    update: {
      type: data.type,
      name: data.name,
      description: data.description,
      pluginIconUrl: data.pluginIconUrl,
      pluginName: data.pluginName,
      pluginDescriptionForHumans: data.pluginDescriptionForHumans,
      pluginDescriptionForModel: data.pluginDescriptionForModel,
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

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
