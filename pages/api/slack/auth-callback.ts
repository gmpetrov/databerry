import { Datastore, IntegrationType } from '@prisma/client';
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
    datastoreId: string;
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

  const { data } = response;

  if (!data.ok) {
    console.log(data);
    throw new Error('Slack auth failed');
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: metadata.datastoreId,
    },
    include: {
      apiKeys: true,
    },
  });

  if (datastore?.ownerId !== metadata.userId) {
    throw new Error('Unauthorized');
  }

  let apiKey = datastore?.apiKeys[0];

  if (!apiKey) {
    apiKey = await prisma.datastoreApiKey.create({
      data: {
        datastoreId: datastore.id,
        key: uuidv4(),
      },
    });
  }

  const accessToken = data.access_token;
  const teamId = data.team.id;

  await prisma.externalIntegration.upsert({
    where: {
      integrationId: `sl_${teamId}`,
    },
    update: {
      integrationToken: accessToken,
      apiKey: {
        connect: {
          id: apiKey.id,
        },
      },
    },
    create: {
      type: IntegrationType.slack,
      apiKey: {
        connect: {
          id: apiKey.id,
        },
      },
      integrationId: `sl_${teamId}`,
      integrationToken: accessToken,
    },
  });

  return res.redirect(307, `/apps`);
};

handler.get(authCallback);

export default handler;
