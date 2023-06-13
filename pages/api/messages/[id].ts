import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const updateMessage = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const id = req.query.id as string;
  const rating = req.body.eval

  const updateEval = await prisma.message.update({
    where: {
      id,
    },
    data: {
        eval: rating,
        read: true
    }
  });
  return updateEval
};

handler.put(respond(updateMessage));

export default handler;
