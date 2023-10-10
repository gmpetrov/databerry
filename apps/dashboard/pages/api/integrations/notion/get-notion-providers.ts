import axios from 'axios';
import { NextApiResponse } from 'next';

import { ApiError } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import prisma from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getProviders = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const providers = await prisma.serviceProvider.findMany({
      where: {
        organizationId: req?.session?.organization?.id as string,
        AND: {
          type: 'notion',
        },
      },
      select: {
        name: true,
        id: true,
      },
    });

    return providers;
  } catch (e) {
    if (e instanceof ApiError) {
      throw new Error(e.message);
    }
    throw e;
  }
};

handler.get(respond(getProviders));

export default handler;
