import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { formToJsonSchema } from '@chaindesk/lib/forms';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import roles from '@chaindesk/lib/middlewares/roles';
import {
  FormFieldSchema,
  UpdateAgentSchema,
  UpdateFormSchema,
} from '@chaindesk/lib/types/dtos';
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

  const draftConfig = {
    ...updates.draftConfig,
    schema: formToJsonSchema(updates?.draftConfig?.fields as FormFieldSchema[]),
  };

  return prisma.form.update({
    where: {
      id,
    },
    data: {
      ...(updates as any),
      draftConfig: draftConfig as any,
    },
  });
};

handler.patch(
  validate({
    body: UpdateAgentSchema,
    handler: respond(updateForm),
  })
);

export default pipe(cors({ methods: ['DELETE', 'PATCH', 'HEAD'] }), handler);
