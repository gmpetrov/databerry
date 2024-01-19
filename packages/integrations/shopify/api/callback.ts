import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { createAuthApiHandler } from '@chaindesk/lib/createa-api-handler';
import shopify from '../sdk';
import prisma from '@chaindesk/prisma/client';
import { ServiceProviderType } from '@chaindesk/prisma';

const handler = createAuthApiHandler();

export const callback = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const callback = await shopify.auth.callback({
    rawRequest: req,
    rawResponse: res,
  });

  if (!callback.session) {
    throw new Error('Oauth failed. No Session Was Returned');
  }

  const response = await shopify.webhooks.register({
    session: callback.session,
  });

  if (!response['APP_UNINSTALLED'][0].success) {
    console.log(
      `Failed to register APP_UNINSTALLED webhook: ${response['APP_UNINSTALLED'][0].result}`
    );
  }

  await prisma.serviceProvider.upsert({
    where: {
      unique_external_id: {
        externalId: callback.session.shop,
        type: ServiceProviderType.shopify,
      },
    },
    create: {
      name: callback.session.shop,
      type: ServiceProviderType.shopify,
      externalId: callback.session.shop,
      organizationId: req.query.orgId as string,
      config: {
        shopify_offline_session: callback.session,
      } as any,
    },
    update: {
      config: {
        shopify_offline_session: callback.session,
      } as any,
    },
  });

  res.redirect('/integrations/shopify/success');
};

handler.get(callback);

export default handler;
