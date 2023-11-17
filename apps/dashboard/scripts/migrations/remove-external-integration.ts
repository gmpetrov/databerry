import { ServiceProviderType } from '@prisma/client';

import prisma from '@chaindesk/prisma/client';

(async () => {
  const integrations = await prisma.externalIntegration.findMany({
    include: {
      agent: {
        include: {
          organization: true,
        },
      },
    },
  });

  console.log('nb integrations to patch', integrations.length);

  await prisma.serviceProvider.createMany({
    data: integrations.map((integration) => ({
      type: integration.type as ServiceProviderType,
      accessToken: integration.integrationToken,
      config: integration.metadata!,
      externalId:
        integration.type === 'slack'
          ? integration.integrationId?.replace('sl_', '')
          : integration.integrationId,
      organizationId: integration?.agent?.organization?.id,
    })),
  });
})();
