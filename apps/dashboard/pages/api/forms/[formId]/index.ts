import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import roles from '@chaindesk/lib/middlewares/roles';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import { MembershipRole } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const getForm = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const id = req.query.formId as string;

  const existingForm = await prisma.form.findUnique({
    where: {
      id,
    },
  });
  if (!existingForm) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }
  return existingForm;
};

handler.get(respond(getForm));

export const deleteForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.formId as string;

  if (!req?.session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const form = await prisma.form.findUnique({
    where: {
      id,
    },
  });

  if (req?.session?.organization?.id !== form?.organizationId) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return prisma.form.delete({
    where: {
      id,
    },
  });
};

handler.delete(
  pipe(roles([MembershipRole.ADMIN, MembershipRole.OWNER]), respond(deleteForm))
);

export default pipe(cors({ methods: ['GET', 'HEAD'] }), handler);
