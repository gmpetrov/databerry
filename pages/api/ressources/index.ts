import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

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
