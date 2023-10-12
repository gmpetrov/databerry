import dynamic from 'next/dynamic';

export const IntegrationSettingsMap = {
  zendesk: dynamic(() => import('./zendesk/components/IntegrationSettings'), {
    ssr: false,
  }),
};
{
}
