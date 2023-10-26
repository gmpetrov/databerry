import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
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

export default pipe(cors({ methods: ['GET', 'HEAD'] }), handler);
