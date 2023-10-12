import axios from 'axios';
import { NextApiResponse } from 'next';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import uuidv4 from '@chaindesk/lib/uuidv4';
import { Datastore, ServiceProviderType, UserApiKey } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createApiHandler();

export const callback = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const authCode = req.query.code;
  req.logger.info(req.query);
  const metadata = JSON.parse(req.query.state as any) as {
    organizationId: string;
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

  req.logger.info(metadata);

  const { data } = response;

  if (!data.ok) {
    req.logger.info(data);
    throw new Error('Slack auth failed');
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id: metadata.agentId,
    },
  });

  if (agent?.organizationId !== metadata.organizationId) {
    throw new Error('Unauthorized');
  }

  const accessToken = data.access_token;
  const teamId = data.team.id;

  await prisma.serviceProvider.upsert({
    where: {
      unique_external_id: {
        type: ServiceProviderType.slack,
        externalId: teamId,
      },
    },
    update: {
      accessToken,
      agents: {
        connect: {
          id: metadata.agentId,
        },
      },
      config: {
        team: data?.team,
      },
    },
    create: {
      type: ServiceProviderType.slack,
      agents: {
        connect: {
          id: metadata.agentId,
        },
      },
      organization: {
        connect: {
          id: metadata.organizationId,
        },
      },
      externalId: teamId,
      accessToken,
      config: {
        team: data?.team,
      },
    },
  });

  return res.redirect(307, `/agents/${metadata.agentId}?tab=deploy`);
};

handler.get(callback);

export default handler;
