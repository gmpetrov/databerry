import { DatastoreVisibility } from '@prisma/client';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

import { SearchRequestSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';
import runMiddleware from '@app/utils/run-middleware';
import validate from '@app/utils/validate';

const handler = createApiHandler();

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export const getDatastores = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  // get Bearer apiKey from header
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(' ')?.[1];

  if (!apiKey) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const key = await prisma.userApiKey.findUnique({
    where: {
      key: apiKey,
    },
    include: {
      user: {
        include: {
          datastores: {
            select: {
              id: true,
              name: true,
              description: true,
            },
            take: 100,
          },
        },
      },
    },
  });

  return key?.user?.datastores || [];
};

handler.get(respond(getDatastores));

export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
