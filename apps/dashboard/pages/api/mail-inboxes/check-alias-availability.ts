import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import roles from '@chaindesk/lib/middlewares/roles';
import { CheckAliasAvailabilitySchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { MembershipRole } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const checkAliasAvailability = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = CheckAliasAvailabilitySchema.parse(req.body);

  const reservedAliases = [
    'georges',
    'adam',
    'chaindesk',
    'blalbaform',
    'inbox',
    'spam',
    'trash',
    'sent',
    'noreply',
    'test',
  ];

  if (reservedAliases.includes(data.alias)) {
    return {
      available: false,
    };
  }

  const item = await prisma.mailInbox.findUnique({
    where: {
      alias: data.alias,
    },
  });

  return {
    available: !item,
  };
};

handler.post(
  validate({
    body: CheckAliasAvailabilitySchema,
    handler: respond(checkAliasAvailability),
  })
);

// export default pipe(cors({ methods: ['POST', 'HEAD'] }), handler);
export default handler;
