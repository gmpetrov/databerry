import dynamic from 'next/dynamic';

export const IntegrationSettingsMap = {
  zendesk: dynamic(() => import('./zendesk/components/IntegrationSettings'), {
    ssr: false,
  }),
  whatsapp: dynamic(() => import('./whatsapp/components/IntegrationSettings'), {
    ssr: false,
  }),
  telegram: dynamic(() => import('./telegram/components/IntegrationSettings'), {
    ssr: false,
  }),
};
{
}
