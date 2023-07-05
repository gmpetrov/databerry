import { ServiceProviderType } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getServiceProviders = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const type = req.query.type as ServiceProviderType;

  const providers = await prisma.serviceProvider.findMany({
    where: {
      AND: [
        {
          ownerId: session?.user?.id,
        },
        ...(type ? [{ type }] : []),
      ],
    },
  });

  return providers;
};

handler.get(respond(getServiceProviders));

export default handler;
