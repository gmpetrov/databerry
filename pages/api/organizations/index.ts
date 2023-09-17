import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { sessionOrganizationInclude } from '@app/utils/auth';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';

const handler = createAuthApiHandler();

export const getOrganizations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  // const organizations = await prisma.organization.findMany({
  //   where: {
  //     memberships: {
  //       every: {
  //         userId: session?.user?.id!,
  //       },
  //     },
  //   },
  //   include: {
  //     ...sessionOrganizationInclude,
  //   },
  // });

  const memberships = await prisma.membership.findMany({
    where: {
      userId: session?.user?.id!,
    },
    include: {
      organization: {
        include: sessionOrganizationInclude,
      },
    },
  });

  return memberships.map((m) => m.organization);
};

handler.get(respond(getOrganizations));

export const createOrg = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const org = await prisma.organization.create({
    data: {
      name: generateFunId(),
      memberships: {
        create: {
          role: 'OWNER',
          user: {
            connect: {
              id: session?.user?.id,
            },
          },
        },
      },
      apiKeys: {
        create: {
          key: uuidv4(),
        },
      },
    },
  });

  return org;
};

handler.post(respond(createOrg));

export default handler;
