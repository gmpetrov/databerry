import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { createAuthApiHandler } from '@chaindesk/lib/createa-api-handler';
import shopify from '../../sdk';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import prisma from '@chaindesk/prisma/client';
import { LATEST_API_VERSION } from '@shopify/shopify-api';
import { ServiceProviderType } from '@chaindesk/prisma';

const handler = createAuthApiHandler();

const schema = z.object({
  shops: z.array(z.string()),
});

export const deleteScript = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const futureProviders = result.data.shops.map((shop) =>
    prisma.serviceProvider.findUnique({
      where: {
        unique_external_id: {
          externalId: shop,
          type: ServiceProviderType.shopify,
        },
      },
    })
  );

  const providers = await Promise.all(futureProviders);

  const ShopifyDeleteCalls = providers.map((provider) => {
    const client = new shopify.clients.Rest({
      session: (provider?.config as any)?.shopify_offline_session as any,
      apiVersion: LATEST_API_VERSION,
    });

    return client.delete({
      path: `script_tags/${(provider?.config as any)?.script_tag_id}.json`,
    });
  });

  const DbUpdateCalls = providers.map((provider) => {
    delete (provider?.config as any).script_tag_id;

    return prisma.serviceProvider.update({
      where: {
        unique_external_id: {
          externalId: provider?.externalId!,
          type: ServiceProviderType.shopify,
        },
      },
      data: {
        config: provider?.config as any,
      },
    });
  });

  await Promise.all([...ShopifyDeleteCalls, ...DbUpdateCalls]);

  res.send(200);
};

handler.post(deleteScript);

export default handler;
