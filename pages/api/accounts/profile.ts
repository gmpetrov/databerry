import { NextApiResponse } from 'next';

import { UpdateUserProfileSchema } from '@app/types/dtos';
import { AppNextApiRequest } from '@app/types/index';
import { sessionUserInclude } from '@app/utils/auth';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const updateUserProfile = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const { email, ...data } = req.body as UpdateUserProfileSchema;

  const updated = await prisma.user.update({
    where: {
      id: session?.user?.id,
    },
    data: {
      ...data,
    },
    include: {
      ...sessionUserInclude,
    },
  });

  return updated;
};

handler.patch(
  validate({
    body: UpdateUserProfileSchema,
    handler: respond(updateUserProfile),
  })
);

export default handler;
