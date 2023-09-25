import { DatastoreVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { CreateDatastoreRequestSchema, UpdateDatastoreRequestSchema } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
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
      organizationId: session?.organization?.id,
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
  const name = data.name || generateFunId();

  return prisma.datastore.create({
    data: {
      type: data.type,
      name,
      description: data.description,
      visibility: data.isPublic
        ? DatastoreVisibility.public
        : DatastoreVisibility.private,
      organization: {
        connect: {
          id: session?.organization?.id,
        },
      },
      config: {},
      apiKeys: {
        create: {
          key: uuidv4(),
        },
      },
      pluginName: data.pluginName || name?.substring(0, 20),
      pluginDescriptionForHumans: `About ${data.pluginDescriptionForHumans ||
        name?.substring(0, 90)}`,
      pluginDescriptionForModel: `Plugin for searching informations about ${name} to find answers to questions and retrieve relevant information. Use it whenever a user asks something that might be related to ${name}.`,
    },
  });
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
