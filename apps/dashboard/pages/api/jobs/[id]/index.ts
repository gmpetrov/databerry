import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getJob = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const session = req.session;
  const id = req.query.id as string;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      workflow: {
        include: {
          agent: {
            select: {
              organizationId: true,
            },
          },
        },
      },
    },
  });

  if (job?.workflow?.agent?.organizationId !== session.organization.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return job;
};

handler.get(respond(getJob));

export default handler;
