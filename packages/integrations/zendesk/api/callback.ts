import { ServiceProviderType } from '@prisma/client';
import axios from 'axios';
import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createAuthApiHandler } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import prisma from '@chaindesk/prisma/client';
import cuid from 'cuid';
import { scope } from '../lib/config';

interface notionSuccessResponse {
  access_token: string;
  bot_id: string;
  duplicated_template_id: string | null;
  owner: {
    workspace: boolean;
  };
  workspace_icon: string;
  workspace_id: string;
  workspace_name: string;
}

const handler = createAuthApiHandler();

export const callback = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const { code, state } = req.query;

  if (!code || !state) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const response = await axios.post(
    `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/oauth/tokens`,
    {
      grant_type: 'authorization_code',
      code: req.query.code,
      client_id: process.env.ZENDESK_CLIENT_ID,
      client_secret: process.env.ZENDESK_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/integrations/zendesk/callback`,
      scope,
    }
  );

  const accessToken = response.data.access_token as string;
  const { agentId } = JSON.parse((req.query.state as string) || '{}');

  if (!accessToken) {
    throw new Error('Access token is not specified !');
  }

  const existingAccount = await prisma.serviceProvider.findFirst({
    where: {
      accessToken,
    },
  });

  const id = existingAccount?.id || cuid();

  // save token to db
  await prisma.serviceProvider.upsert({
    where: {
      id,
    },
    create: {
      id,
      type: ServiceProviderType.zendesk,
      name: 'Zendesk',
      accessToken,
      organization: {
        connect: {
          id: session?.organization?.id,
        },
      },
      ...(agentId
        ? {
            agents: {
              connect: {
                id: agentId,
              },
            },
          }
        : {}),
    },
    update: {
      name: 'Zendesk',
      accessToken,
    },
  });

  return res.redirect('/close-window');
};

handler.get(callback);

export default handler;
