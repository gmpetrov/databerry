import { NextApiResponse } from 'next';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { client } from '@chaindesk/lib/crisp';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { ServiceProviderType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

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

  let metadata = {} as any;

  try {
    metadata = await client.website.getWebsite(data.website_id);
  } catch (err) {
    req.logger.error(err);
  }

  // if (data.token !== websites[data.website_id]?.token) {
  //   throw new ApiError(ApiErrorType.INVALID_REQUEST);
  // }

  const agent = await prisma.agent.findUnique({
    where: {
      id: data.agentId,
    },
    include: {
      organization: {
        include: {
          apiKeys: true,
        },
      },
    },
  });

  if (!agent?.organization?.apiKeys?.find((one) => one.key === data.apiKey)) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  await prisma.serviceProvider.upsert({
    where: {
      unique_external_id: {
        type: ServiceProviderType.crisp,
        externalId: data.website_id,
      },
    },
    create: {
      type: ServiceProviderType.crisp,
      externalId: data.website_id,
      agents: {
        connect: {
          id: data.agentId,
        },
      },
      organization: {
        connect: {
          id: agent?.organization?.id,
        },
      },
      config: {
        ...metadata,
      },
    },
    update: {
      agents: {
        connect: {
          id: data.agentId,
        },
      },
      config: {
        ...metadata,
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
