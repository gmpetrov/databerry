import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import roles from '@chaindesk/lib/middlewares/roles';
import { UpdateAgentSchema, UpdateFormSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { MembershipRole } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
const handler = createAuthApiHandler();

export const updateForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const updates = UpdateFormSchema.parse(req.body);
  const id = req.query.formId as string;

  return prisma.form.update({
    where: {
      id,
    },
    data: {
      ...updates,
    },
  });
};

handler.patch(
  validate({
    body: UpdateAgentSchema,
    handler: respond(updateForm),
  })
);

export const deleteForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.formId as string;

  const existingForm = await prisma.form.findUnique({
    where: {
      id,
    },
  });

  if (!existingForm) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
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

export default pipe(cors({ methods: ['DELETE', 'PATCH', 'HEAD'] }), handler);
