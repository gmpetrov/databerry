import { IntegrationType } from '@prisma/client';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createAuthApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
import uuidv4 from '@app/utils/uuid';
import validate from '@app/utils/validate';

const handler = createAuthApiHandler();

export const getSlackIntegrations = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;

  const integrations = await prisma.externalIntegration.findMany({
    where: {
      type: IntegrationType.slack,
      apiKey: {
        datastore: {
          ownerId: session.user.id,
        },
      },
    },
    include: {
      apiKey: {
        include: {
          datastore: true,
        },
      },
    },
  });

  return integrations;
};

handler.get(respond(getSlackIntegrations));

const UpdateSchema = z.object({
  id: z.string().min(1),
  datastoreId: z.string().min(1),
});

export const updateSlackIntegration = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as z.infer<typeof UpdateSchema>;

  const integration = await prisma.externalIntegration.findUnique({
    where: {
      id: data.id,
    },
    include: {
      apiKey: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (integration?.apiKey?.datastore?.ownerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: data.datastoreId,
    },
    include: {
      apiKeys: true,
    },
  });

  if (datastore?.ownerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  let apiKey = datastore?.apiKeys[0];

  if (!apiKey) {
    apiKey = await prisma.datastoreApiKey.create({
      data: {
        key: uuidv4(),
        datastore: {
          connect: {
            id: datastore.id,
          },
        },
      },
    });
  }

  const updated = await prisma.externalIntegration.update({
    where: {
      id: data.id,
    },
    data: {
      apiKey: {
        connect: {
          id: apiKey.id,
        },
      },
    },
  });

  return updated;
};

handler.put(
  validate({
    body: UpdateSchema,
    handler: respond(updateSlackIntegration),
  })
);

const DeleteSchema = UpdateSchema.omit({
  datastoreId: true,
});

export const deleteSlackIntegration = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const data = req.body as z.infer<typeof DeleteSchema>;

  const integration = await prisma.externalIntegration.findUnique({
    where: {
      id: data.id,
    },
    include: {
      apiKey: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (integration?.apiKey?.datastore?.ownerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.externalIntegration.delete({
    where: {
      id: data.id,
    },
  });

  return updated;
};

handler.delete(
  validate({
    body: DeleteSchema,
    handler: respond(deleteSlackIntegration),
  })
);

export default handler;
