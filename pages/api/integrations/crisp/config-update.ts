import { IntegrationType } from '@prisma/client';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import { getConnectedWebsites } from '@app/utils/crisp';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

const schema = z.object({
  website_id: z.string().min(1),
  token: z.string().min(1),
  apiKey: z.string().min(1),
  agentId: z.string().min(1),
});

export const updateCrispConfig = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as z.infer<typeof schema>;

  // const websites = await getConnectedWebsites();

  // if (data.token !== websites[data.website_id]?.token) {
  //   throw new ApiError(ApiErrorType.INVALID_REQUEST);
  // }

  const agent = await prisma.agent.findUnique({
    where: {
      id: data.agentId,
    },
    include: {
      owner: {
        include: {
          apiKeys: true,
        },
      },
    },
  });

  if (!agent?.owner?.apiKeys?.find((one) => one.key === data.apiKey)) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await prisma.externalIntegration.upsert({
    where: {
      integrationId: data.website_id,
    },
    create: {
      type: IntegrationType.crisp,
      integrationId: data.website_id,
      agent: {
        connect: {
          id: data.agentId,
        },
      },
    },
    update: {
      agent: {
        connect: {
          id: data.agentId,
        },
      },
    },
  });

  return {
    success: true,
  };
};

handler.post(
  validate({
    body: schema,
    handler: respond(updateCrispConfig),
  })
);

export default handler;
