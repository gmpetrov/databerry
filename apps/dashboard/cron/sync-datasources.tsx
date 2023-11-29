import { DatasourceType } from '@prisma/client';
import pMap from 'p-map';

import logger from '@chaindesk/lib/logger';
import triggerTaskLoadDatasource from '@chaindesk/lib/trigger-task-load-datasource';
import { prisma } from '@chaindesk/prisma/client';

(async () => {
  logger.info(`Starting cron job: Sync Datasources`);

  const datasources = await prisma.appDatasource.findMany({
    where: {
      group: {
        // do not include datasource part of a group as the group will handle the sync
        is: null,
      },
      type: {
        in: [
          DatasourceType.google_drive_folder,
          DatasourceType.google_drive_file,
          DatasourceType.notion,
          DatasourceType.notion_page,
          DatasourceType.web_page,
          DatasourceType.web_site,
        ],
      },
      organization: {
        subscriptions: {
          some: {
            status: {
              in: ['active', 'trialing'],
            },
          },
        },
      },
    },
    select: {
      id: true,
      organizationId: true,
    },
  });

  logger.info(`Triggering synch for ${datasources.length} datasources`);

  await triggerTaskLoadDatasource(
    datasources.map((each) => ({
      organizationId: each.organizationId!,
      datasourceId: each.id!,
      priority: 100000,
    }))
  );

  logger.info(`Finished cron job: Sync Datasources`);

  process.exit(0);
})();
