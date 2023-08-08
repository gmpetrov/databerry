import { IntegrationType } from '@prisma/client';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import createIntegrationId from '@app/utils/create-integration-id';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

const schema = z.object({
  integrationType: z.nativeEnum(IntegrationType),
  agentId: z.string().min(1),
  siteurl: z.string().min(1),
});

export const updateIntegrationConfig = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as z.infer<typeof schema>;
  const name = req.query.name as 'wordpress' | 'shopify';

  const agent = await prisma.agent.findUnique({
    where: {
      id: data.agentId,
    },
  });

  if (agent?.ownerId !== session?.user?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const integrationId = await createIntegrationId({
    userId: session.user.id,
    siteurl: data.siteurl,
  });
  let metadata = {
    integrationName: name,
    siteurl: data.siteurl,
  } as any;

  await prisma.externalIntegration.upsert({
    where: {
      integrationId: integrationId,
    },
    create: {
      type: data.integrationType,
      integrationId: integrationId,
      agent: {
        connect: {
          id: data.agentId,
        },
      },
      metadata: {
        ...metadata,
      },
    },
    update: {
      agent: {
        connect: {
          id: data.agentId,
        },
      },
      metadata: {
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
    handler: respond(updateIntegrationConfig),
  })
);

export default handler;
