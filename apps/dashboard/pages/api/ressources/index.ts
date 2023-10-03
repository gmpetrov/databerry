import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const searchRessources = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const search = req.query.search as string;

  const org = await prisma.organization.findUnique({
    where: {
      id: session?.organization?.id,
    },
    include: {
      datastores: {
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      },
      agents: {
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      },
      appDatasources: {
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      },
    },
  });

  return {
    agents: org?.agents,
    datastores: org?.datastores,
    datasources: org?.appDatasources,
  };
};

handler.get(respond(searchRessources));

export default handler;
