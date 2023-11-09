import axios from 'axios';
import { NextApiResponse } from 'next';
import getConfig from 'next/config';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest, AppStatus } from '@chaindesk/lib/types';
import { prisma } from '@chaindesk/prisma/client';

const handler = createApiHandler();

export const getStatus = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  let dbCheck = AppStatus.OK;
  let vectorDbCheck = AppStatus.OK;
  let openAICheck = AppStatus.OK;
  const { publicRuntimeConfig } = getConfig();

  try {
    await prisma.user.count();
  } catch {
    dbCheck = AppStatus.KO;
  }

  try {
    const { data } = await axios.get(
      'https://status.openai.com/api/v2/status.json'
    );
    if (data.status.indicator === 'major') {
      openAICheck = AppStatus.KO;
    }
  } catch {
    openAICheck = AppStatus.KO;
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

  if (
    dbCheck === AppStatus.KO ||
    vectorDbCheck === AppStatus.KO ||
    openAICheck === AppStatus.KO
  ) {
    status = AppStatus.WARNING;
  }

  if (dbCheck === AppStatus.KO && vectorDbCheck === AppStatus.KO) {
    status = AppStatus.KO;
  }

  return {
    status,
    db: dbCheck,
    vectorDb: vectorDbCheck,
    openAI: openAICheck,
    isMaintenance: process.env.MAINTENANCE_MODE === 'true',
    latestVersion: publicRuntimeConfig.version,
  };
};

handler.get(respond(getStatus));

export default handler;
