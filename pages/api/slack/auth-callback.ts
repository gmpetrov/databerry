import { Datastore, IntegrationType } from '@prisma/client';
import axios from 'axios';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const authCallback = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const authCode = req.query.code;
  console.log('PAYLOAD', req.query);

  const response = await axios.post(
    'https://slack.com/api/oauth.v2.access',
    null,
    {
      params: {
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code: authCode,
      },
    }
  );

  const { data } = response;

  if (!data.ok) {
    console.log(data);
    throw new Error('Slack auth failed');
  }

  const accessToken = data.access_token;
  const teamId = data.team.id;

  await prisma.externalIntegration.upsert({
    where: {
      integrationId: `sl_${teamId}`,
    },
    update: {
      integrationToken: accessToken,
    },
    create: {
      type: IntegrationType.slack,
      integrationId: `sl_${teamId}`,
      integrationToken: accessToken,
    },
  });

  return res.redirect(307, `/apps`);
};

handler.get(authCallback);

export default handler;
