import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const getAgents = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const secret = req.query.secret as string;

  if (secret !== process.env.NEXTAUTH_SECRET) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const result = await prisma.usage.updateMany({
    data: {
      nbAgentQueries: 0,
      nbDataProcessingBytes: 0,
    },
  });

  console.log(`Processed ${result.count} items`);

  return result;
};

handler.get(respond(getAgents));

export default handler;
