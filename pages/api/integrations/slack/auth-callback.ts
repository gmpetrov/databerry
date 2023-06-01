import { Datastore, IntegrationType, UserApiKey } from '@prisma/client';
import axios from 'axios';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';

const handler = createApiHandler();

export const authCallback = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const authCode = req.query.code;
  console.log('PAYLOAD', req.query);
  const metadata = JSON.parse(req.query.state as any) as {
    userId: string;
    agentId: string;
  };

  const response = await axios.post(
    'https://slack.com/api/oauth.v2.access',
    null,
    {
      params: {
        client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code: authCode,
      },
    }
  );

  console.log('metadata', metadata);

  const { data } = response;

  if (!data.ok) {
    console.log(data);
    throw new Error('Slack auth failed');
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id: metadata.agentId,
    },
  });

  if (agent?.ownerId !== metadata.userId) {
    throw new Error('Unauthorized');
  }

  const accessToken = data.access_token;
  const teamId = data.team.id;

  await prisma.externalIntegration.upsert({
    where: {
      integrationId: `sl_${teamId}`,
    },
    update: {
      integrationToken: accessToken,
      agent: {
        connect: {
          id: metadata.agentId,
        },
      },
      metadata: {
        team: data?.team,
      },
    },
    create: {
      type: IntegrationType.slack,
      agent: {
        connect: {
          id: metadata.agentId,
        },
      },
      integrationId: `sl_${teamId}`,
      integrationToken: accessToken,
      metadata: {
        team: data?.team,
      },
    },
  });

  return res.redirect(307, `/agents/${metadata.agentId}?tab=deploy`);
};

handler.get(authCallback);

export default handler;
