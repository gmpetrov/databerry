import '@app/workers/datasource-loader';
import '@app/cron/daily-leads';

import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';

const handler = createApiHandler();

export const loadWorkers = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  return {
    hello: 'world',
  };
};

handler.get(respond(loadWorkers));

export default handler;
