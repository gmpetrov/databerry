import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import generateFunId from '@chaindesk/lib/generate-fun-id';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { UpdateOrgSchema } from '@chaindesk/lib/types/dtos';
import uuidv4 from '@chaindesk/lib/uuidv4';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getOrg = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;

  const org = await prisma.organization.findUnique({
    where: {
      id: req.query.id as string,
    },
    include: {
      subscriptions: {
        where: {
          status: {
            in: ['active', 'trialing'],
          },
        },
      },
      memberships: {
        where: {
          userId: session?.user?.id,
        },
      },
    },
  });

  if (!org?.memberships) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return org;
};

handler.get(respond(getOrg));

export const updateOrg = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as UpdateOrgSchema;
  const id = req.query.id as string;

  if (id !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return prisma.organization.update({
    where: {
      id,
    },
    data: {
      ...data,
    },
  });
};

handler.patch(
  validate({
    body: UpdateOrgSchema,
    handler: respond(updateOrg),
  })
);

export const deleteOrg = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const org = await prisma.organization.findUnique({
    where: {
      id: req.query.id as string,
    },
    include: {
      memberships: {
        where: {
          userId: session?.user?.id,
          OR: [
            {
              role: 'OWNER',
            },
            {
              role: 'ADMIN',
            },
          ],
        },
      },
    },
  });

  if (!org?.memberships) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return prisma.organization.delete({
    where: {
      id: req.query.id as string,
    },
  });
};

handler.delete(
  validate({
    handler: respond(updateOrg),
  })
);

export default handler;
