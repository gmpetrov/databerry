import axios from 'axios';
import { NextApiResponse } from 'next';

import { AppNextApiRequest, AppStatus } from '@app/types';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const getStatus = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  let dbCheck = AppStatus.OK;
  let vectorDbCheck = AppStatus.OK;

  try {
    await prisma.user.count();
  } catch {
    dbCheck = AppStatus.KO;
  }

  try {
    const client = axios.create({
      baseURL: process.env.QDRANT_API_URL,
      headers: {
        'api-key': process.env.QDRANT_API_KEY,
      },
    });

    await client.get('/aliases');
  } catch {
    vectorDbCheck = AppStatus.KO;
  }

  let status = AppStatus.OK;

  if (dbCheck === AppStatus.KO || vectorDbCheck === AppStatus.KO) {
    status = AppStatus.WARNING;
  }
  if (dbCheck === AppStatus.KO && vectorDbCheck === AppStatus.KO) {
    status = AppStatus.KO;
  }

  return {
    status,
    db: dbCheck,
    vectorDb: vectorDbCheck,
    isMaintenance: process.env.MAINTENANCE_MODE === 'true',
  };
};

handler.get(respond(getStatus));

export default handler;
