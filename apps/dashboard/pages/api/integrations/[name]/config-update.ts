import { NextApiResponse } from 'next';
import { z } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import createIntegrationId from '@chaindesk/lib/create-integration-id';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';
import { IntegrationType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

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
  const name = req.query.name as 'wordpress' | 'shopify' | 'prestashop';

  const agent = await prisma.agent.findUnique({
    where: {
      id: data.agentId,
    },
  });

  if (agent?.organizationId !== session?.organization?.id) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const integrationId = await createIntegrationId({
    organizationId: session.organization.id,
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
