import { NextApiResponse } from 'next';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';

import { z } from 'zod';
import prisma from '@chaindesk/prisma/client';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import axios from 'axios';

const handler = createAuthApiHandler();

const AddSchema = z.object({
  http_token: z.string().regex(/^\d+:[\w-]+$/),
  secret_key: z.string().cuid(),
  bot_name: z.string(),
  bot_id: z.number(),
  agentId: z.string(),
});

const add = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const data = AddSchema.parse(req.body);
  const session = req.session;

  const agent = await prisma.agent.findUnique({
    where: {
      id: data.agentId,
    },
  });

  if (agent?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const existingProvider = await prisma.serviceProvider.findUnique({
    where: {
      unique_external_id: {
        type: 'telegram',
        externalId: `${data.bot_id}`,
      },
    },
    include: {
      agents: true,
    },
  });

  const alreadyInuse = (existingProvider?.agents?.length || 0) > 0;

  if (alreadyInuse) {
    return { status: 400, message: 'This http_token is alreay in use.' };
  }

  // set telegram webhook.
  const { data: webhookData } = await axios.post(
    `https://api.telegram.org/bot${data.http_token}/setWebhook`,
    {
      url: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/integrations/telegram/webhook`,
      secret_token: `${data.secret_key}-${data.bot_id}`,
      allowed_updates: ['channel_post', 'message'], // only listens to direct/channel incoming messages
      max_connections: 40,
      drop_pending_updates: false,
    }
  );

  if (!webhookData.ok) {
    return { status: 400, message: 'Unable to set webhook on the bot' };
  }

  await prisma.serviceProvider.upsert({
    where: {
      unique_external_id: {
        type: 'telegram',
        externalId: `${data.bot_id}`,
      },
    },
    create: {
      type: 'telegram',
      config: {
        http_token: data.http_token,
        secret_key: data.secret_key,
      },
      name: data.bot_name,
      ...(data.agentId
        ? {
            agents: {
              connect: {
                id: data.agentId,
              },
            },
          }
        : {}),
      organization: {
        connect: {
          id: session?.organization?.id,
        },
      },
      owner: {
        connect: {
          id: session?.user?.id,
        },
      },
      externalId: `${data.bot_id}`,
    },
    update: {
      agents: {
        connect: {
          id: data.agentId,
        },
      },
    },
  });

  return { status: 200 };
};

handler.post(
  validate({
    handler: respond(add),
    body: AddSchema,
  })
);

export default handler;
