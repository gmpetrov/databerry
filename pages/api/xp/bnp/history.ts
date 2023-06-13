import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getHistoryBNP = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const datastoreId = req.body.datastoreId as string;

  const messages = await prisma.messageBNP.findMany({
    where: {
      datastoreId,
    },
    take: -20,
    orderBy: {
      createdAt: 'asc',
    },
  });

  return { messages };
};

handler.get(respond(getHistoryBNP));

export const deleteHistoryBNP = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const datastoreId = req.body.datastoreId as string;

  await prisma.messageBNP.deleteMany({
    where: {
      datastoreId,
    },
  });

  return true;
};

handler.delete(respond(deleteHistoryBNP));

export default handler;
