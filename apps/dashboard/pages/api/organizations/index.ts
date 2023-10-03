import { NextApiResponse } from 'next';

import { sessionOrganizationInclude } from '@chaindesk/lib/auth';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import uuidv4 from '@chaindesk/lib/uuidv4';
import { prisma } from '@chaindesk/prisma/client';

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
      usage: {
        create: {},
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
