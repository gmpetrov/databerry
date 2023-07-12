import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const me = async (req: AppNextApiRequest, res: NextApiResponse) => {
  // get Bearer token from header
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(' ')?.[1];

  if (!apiKey) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const found = await prisma.userApiKey.findUnique({
    where: {
      key: apiKey,
    },
    include: {
      user: {
        include: {
          subscriptions: true,
        },
      },
    },
  });

  if (!found) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return found.user;
};

handler.get(respond(me));

export default handler;
