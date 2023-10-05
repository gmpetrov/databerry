import { NextApiResponse } from 'next';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import logger from '@chaindesk/lib/logger';
import { AppNextApiRequest, AppStatus } from '@chaindesk/lib/types';

const handler = createApiHandler();

export const forwardBuildLog = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  // await fetch('https://api.axiom.co/v1/datasets/build/ingest', {
  //   body: JSON.stringify(req.body),
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
  //   },
  // });

  await fetch(
    `https://discord.com/api/webhooks/1150382923871158282/${process.env.DISCORD_WEBHOOK_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: JSON.stringify(req.body, null, 2),
      }),
    }
  );

  res.setHeader('x-vercel-verify', '6ebf4087434daf8193f187d0e12a2810098cdf2e');

  return res.status(200).json({ success: true });
};

handler.post(respond(forwardBuildLog));

export default handler;
