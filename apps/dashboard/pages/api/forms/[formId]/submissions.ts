import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { prisma } from '@chaindesk/prisma/client';

const handler = createAuthApiHandler();

export const getSubmissions = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const formId = req.query.formId as string;
  const cursor = req.query.cursor as string;

  const submissions = await prisma.formSubmission.findMany({
    where: {
      formId,
      form: {
        organizationId: session?.organization?.id,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      form: true,
    },
    take: 100,

    ...(cursor
      ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }
      : {}),
  });

  if (
    submissions?.length > 0 &&
    submissions?.[0]?.form?.organizationId !== session?.organization?.id
  ) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return submissions;
};

handler.get(respond(getSubmissions));

export default handler;
