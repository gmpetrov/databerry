import { ServiceProviderZendesk } from '@chaindesk/lib/types/dtos';

const formatAuthHeader = (config: ServiceProviderZendesk['config']) => {
  return `Basic ${Buffer.from(
    `${config?.email}/token:${config?.apiToken}`
  ).toString('base64')}`;
};

export default formatAuthHeader;
