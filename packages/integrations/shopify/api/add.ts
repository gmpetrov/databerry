import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { createLazyAuthHandler } from '@chaindesk/lib/createa-api-handler';
import shopify from '../sdk';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { handleGetSession } from '@chaindesk/lib/auth';
import prisma from '@chaindesk/prisma/client';
import { ServiceProviderType } from '@chaindesk/prisma';
import { shopSchema } from '../../../../apps/dashboard/components/ConnectShopifyStore';

const querySchema = shopSchema.extend({
  agentId: z.string().cuid().optional(),
});

const handler = createLazyAuthHandler();

export const add = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const result = await querySchema.safeParseAsync(req.query);
  if (!result.success) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const shop = result.data.shop;

  const sanitizedShop = shopify.utils.sanitizeShop(shop, false);

  if (!sanitizedShop) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: {
      unique_external_id: {
        externalId: sanitizedShop,
        type: ServiceProviderType.shopify,
      },
    },
  });

  if (provider) {
    res.redirect('/integrations/shopify/success');
  }

  const session = await handleGetSession(req, res);

  if (!session) {
    res.redirect(
      `${process.env.SHOPIFY_HOST_URL}/signin?callbackUrl=/api/integrations/shopify/add?shop=${shop}&error=SessionRequired`
    );
  }

  const agentId = result.data.agentId;

  await prisma.serviceProvider.create({
    data: {
      organization: {
        connect: {
          id: session!.organization.id,
        },
      },
      type: ServiceProviderType.shopify,
      externalId: sanitizedShop,
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
  });

  return shopify.auth.begin({
    shop: sanitizedShop,
    callbackPath: '/api/integrations/shopify/callback',
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });
};

handler.get(add);

export default handler;
