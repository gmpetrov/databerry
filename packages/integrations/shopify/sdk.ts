import getRootDomain from '@chaindesk/lib/get-root-domain';
import {
  shopifyApi,
  LATEST_API_VERSION,
  DeliveryMethod,
} from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY!,
  scopes: [
    'read_products',
    'write_script_tags',
    'read_script_tags',
    'read_orders',
  ],
  hostName: getRootDomain(process.env.SHOPIFY_HOST_URL!),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

shopify.webhooks.addHandlers({
  APP_UNINSTALLED: [
    {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: `${process.env.SHOPIFY_HOST_URL}/api/integrations/shopify/deleteWebhook`,
    },
  ],
});

export default shopify;
