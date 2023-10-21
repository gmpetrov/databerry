import pMap from 'p-map';
import pRetry from 'p-retry';

import { QdrantManager } from '@chaindesk/lib/datastores/qdrant';
import { prisma } from '@chaindesk/prisma/client';

(async () => {
  console.log('process.env', process.env.DATABASE_URL);
  console.log('process.env', process.env.QDRANT_API_URL);
  const prevUrl = 'https://databerry.s3.amazonaws.com';
  const newUrl = 'https://s3.chaindesk.ai';
  const datasources = await prisma.appDatasource.findMany({
    where: {
      config: {
        path: ['source_url'],
        string_starts_with: prevUrl,
      },
    },
  });
  const datastores = await prisma.datastore.findMany({
    where: {
      pluginIconUrl: {
        startsWith: prevUrl,
      },
    },
  });

  const agents = await prisma.agent.findMany({
    where: {
      iconUrl: {
        startsWith: prevUrl,
      },
    },
  });

  console.log('nb datasources to patch', datasources.length);
  console.log('nb datastores to patch', datastores.length);
  console.log('nb agents to patch', agents.length);

  // await prisma.$transaction(
  //   async (tx) => {
  //     for (const ds of datasources) {
  //       await tx.appDatasource.update({
  //         where: {
  //           id: ds.id,
  //         },
  //         data: {
  //           config: {
  //             ...(ds.config as any),
  //             source_url: (ds.config as any).source_url.replace(
  //               prevUrl,
  //               newUrl
  //             ),
  //           },
  //         },
  //       });
  //     }

  //     for (const ds of datastores) {
  //       await tx.datastore.update({
  //         where: {
  //           id: ds.id,
  //         },
  //         data: {
  //           pluginIconUrl: ds.pluginIconUrl?.replace(prevUrl, newUrl),
  //         },
  //       });
  //     }

  //     for (const agent of agents) {
  //       await tx.agent.update({
  //         where: {
  //           id: agent.id,
  //         },
  //         data: {
  //           iconUrl: agent.iconUrl?.replace(prevUrl, newUrl),
  //         },
  //       });
  //     }
  //   },
  //   {
  //     maxWait: 1000 * 60 * 20, // 20mins
  //     timeout: 1000 * 60 * 20, // 20mins
  //   }
  // );

  let counter = 1;
  await pMap(
    datasources,
    async (ds) => {
      await pRetry(
        async () => {
          const newSourceUrl = (ds.config as any).source_url.replace(
            prevUrl,
            newUrl
          );
          await QdrantManager.updateMetadata({
            payload: {
              source_url: newSourceUrl,
            },
            filters: {
              datasource_ids: [ds.id],
            },
          });
          console.log(`done: ${counter++}/${datasources.length}`);
        },
        {
          retries: 10,
        }
      );
    },
    {
      concurrency: 10,
    }
  );
  console.log('done');
})();
