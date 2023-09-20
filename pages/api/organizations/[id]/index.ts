import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { UpdateOrgSchema } from '@app/types/dtos';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import generateFunId from '@app/utils/generate-fun-id';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';
import validate from '@app/utils/validate';

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
          status: 'active',
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
