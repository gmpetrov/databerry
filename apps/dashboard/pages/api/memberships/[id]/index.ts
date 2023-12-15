import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import pipe from '@chaindesk/lib/middlewares/pipe';
import roles from '@chaindesk/lib/middlewares/roles';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { MembershipRole } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

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

  if (membership?.organizationId !== req.session?.organization?.id) {
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
