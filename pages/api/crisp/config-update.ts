import { IntegrationType } from '@prisma/client';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import validate from '@app/utils/validate';

const handler = createApiHandler();

const schema = z.object({
  website_id: z.string().min(1),
  token: z.string().min(1),
  databerryApiKey: z.string().min(1),
});

export const updateCrispConfig = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as z.infer<typeof schema>;

  await prisma.externalIntegration.upsert({
    where: {
      integrationId: data.website_id,
    },
    create: {
      type: IntegrationType.crisp,
      integrationId: data.website_id,
      apiKey: {
        connect: {
          key: data.databerryApiKey,
        },
      },
    },
    update: {
      apiKey: {
        connect: {
          key: data.databerryApiKey,
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
