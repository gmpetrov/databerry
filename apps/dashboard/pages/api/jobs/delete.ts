import { NextApiResponse } from 'next';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const DeleteJobsSchema = z.object({
  ids: z.array(z.string()),
});

export const bulkDelete = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const { ids } = DeleteJobsSchema.parse(req.body);
  const session = req.session;

  const jobs = await prisma.job.findMany({
    where: {
      id: {
        in: ids,
      },
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

  for (const job of jobs) {
    if (job.workflow?.agent.organizationId !== session.organization.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  }

  const deleted = await prisma.job.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return deleted.count;
};

handler.post(
  validate({
    body: DeleteJobsSchema,
    handler: respond(bulkDelete),
  })
);

export default handler;
