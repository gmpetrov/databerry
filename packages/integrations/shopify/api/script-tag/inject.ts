import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { createAuthApiHandler } from '@chaindesk/lib/createa-api-handler';
import shopify from '../../sdk';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import prisma from '@chaindesk/prisma/client';
import { LATEST_API_VERSION } from '@shopify/shopify-api';
import { ServiceProviderType } from '@chaindesk/prisma';
import { shopSchema } from '../../../../../apps/dashboard/components/ConnectShopifyStore';
const handler = createAuthApiHandler();

const schema = shopSchema.extend({
  agentId: z.string().cuid(),
});

export const inject = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const result = await schema.safeParseAsync(req.body);
  if (!result.success) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }
  const serviceProvider = await prisma.serviceProvider.findUniqueOrThrow({
    where: {
      unique_external_id: {
        externalId: result.data.shop,
        type: ServiceProviderType.shopify,
      },
    },
  });

  const client = new shopify.clients.Rest({
    session: (serviceProvider?.config as any)?.shopify_offline_session as any,
    apiVersion: LATEST_API_VERSION,
  });

  const script = await client.post({
    path: 'script_tags.json',
    data: {
      script_tag: {
        event: 'onload',
        // TODO: update script src.
        src: `https://cdn.jsdelivr.net/gh/boddapQ/script@4.0.7/inject.js?agentId=${result.data.agentId}`,
        display_scope: 'online_store',
      },
    },
  });

  await prisma.serviceProvider.update({
    where: {
      unique_external_id: {
        externalId: result.data.shop,
        type: ServiceProviderType.shopify,
      },
    },
    data: {
      config: {
        shopify_offline_session: {
          ...((serviceProvider?.config as any)?.shopify_offline_session as any),
        },
        script_tag_id: script.body?.script_tag?.id,
      } as any,
    },
  });
  res.send(200);
};

handler.post(inject);

export default handler;
