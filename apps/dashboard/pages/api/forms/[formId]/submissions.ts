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
  // const cursor = req.query.cursor as string;
  const offset = parseInt((req.query.offset as string) || '0');
  const limit = parseInt((req.query.limit as string) || '100');

  const form = await prisma.form.findUnique({
    where: {
      id: formId,
    },
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
      submissions: {
        skip: offset * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        // ...(cursor
        //   ? {
        //       skip: 1,
        //       cursor: {
        //         id: cursor,
        //       },
        //     }
        //   : {}),
      },
    },
  });

  if (form?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return {
    submissions: form?.submissions || [],
    total: form?._count?.submissions,
  };
};

handler.get(respond(getSubmissions));

export default handler;
