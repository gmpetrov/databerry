import { MembershipRole } from '@prisma/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { sessionOrganizationInclude } from '@app/utils/auth';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import pipe from '@app/utils/middlewares/pipe';
import roles from '@app/utils/middlewares/roles';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const deleteMembership = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const membership = await prisma.membership.findUnique({
    where: {
      id: req.query.id as string,
    },
  });

  if (membership?.role === MembershipRole.OWNER) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return prisma.membership.delete({
    where: {
      id: req.query.id as string,
    },
  });
};

handler.delete(
  pipe(
    roles([MembershipRole.OWNER, MembershipRole.ADMIN]),
    respond(deleteMembership)
  )
);

export default handler;
