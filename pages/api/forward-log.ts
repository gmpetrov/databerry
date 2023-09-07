import { NextApiResponse } from 'next';

import { AppNextApiRequest, AppStatus } from '@app/types';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import logger from '@app/utils/logger';

const handler = createApiHandler();

export const forwardLog = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  await fetch('https://api.axiom.co/v1/datasets/build/ingest', {
    body: JSON.stringify(req.body),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
    },
  });

  res.setHeader('x-vercel-verify', '6ebf4087434daf8193f187d0e12a2810098cdf2e');

  return res.status(200).json({ success: true });
};

handler.post(respond(forwardLog));

export default handler;
