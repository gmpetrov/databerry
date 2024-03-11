import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import prisma from '@chaindesk/prisma/client';
import { ServiceProviderType } from '@chaindesk/prisma';
import shopify from '../sdk';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
const handler = createLazyAuthHandler();

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhook = async (req: AppNextApiRequest, res: NextApiResponse) => {
  //TODO: validation.
  // const validation = await shopify.webhooks.validate({
  //   rawBody: req.body,
  //   rawRequest: req,
  //   rawResponse: res,
  // });

  // if (!validation.valid) {
  //   throw new ApiError(ApiErrorType.UNAUTHORIZED);
  // }

  const shopify_hmac = req.headers['x-shopify-hmac-sha256'];

  if (!shopify_hmac) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: {
      unique_external_id: {
        type: ServiceProviderType.shopify,
        externalId: req.body.domain,
      },
    },
  });

  if (!provider) {
    throw new Error('Service provider does not exist.');
  }

  await prisma.serviceProvider.delete({
    where: {
      unique_external_id: {
        type: ServiceProviderType.shopify,
        externalId: req.body.domain,
      },
    },
  });

  return { status: 200 };
};

handler.post(respond(webhook));

export default handler;
