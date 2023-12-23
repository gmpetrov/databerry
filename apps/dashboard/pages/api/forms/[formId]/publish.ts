import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { prisma } from '@chaindesk/prisma/client';

const handler = createApiHandler();

export const publishForm = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const formId = req.query.formId as string;
  const found = await prisma.form.findUnique({
    where: {
      id: formId,
    },
    select: {
      draftConfig: true,
    },
  });

  if (!found) {
    throw new ApiError(ApiErrorType.NOT_FOUND);
  }

  const fields = (found?.draftConfig as any)?.fields;

  if (!fields) {
    throw new Error('Must register at least one ield');
  }
  const updated = await prisma.form.update({
    where: {
      id: formId,
    },
    data: {
      publishedConfig: found?.draftConfig as any,
    },
  });

  // TODO: add publish form-to-url logic
  return updated;
};

handler.post(respond(publishForm));

export default handler;
