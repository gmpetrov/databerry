import axios from 'axios';
import pMap from 'p-map';

import { DatastoreManager } from '@app/utils/datastores';
import prisma from '@app/utils/prisma-client';

const qdrantClient = axios.create({
  baseURL: process.env.QDRANT_API_URL,
  headers: {
    'api-key': process.env.QDRANT_API_KEY,
  },
});

(async () => {
  const DATASTORE_ID = 'cljz1bnn50002rg6hemmia8ev';

  const datastores = await prisma.datastore.findMany({
    select: {
      id: true,
    },
  });

  const processDatatore = async (datastoreId: string) => {
    const datastore = await prisma.datastore.findUnique({
      where: {
        id: datastoreId,
      },
      include: {
        datasources: {
          select: {
            id: true,
          },
        },
      },
    });

    const datasourceIds = datastore?.datasources.map((ds) => ds.id);

    const dsIdsOnQdrant = new Set<string>();

    let hasReachedEnd = false;
    let offset: string | undefined = undefined;
    while (!hasReachedEnd) {
      const qdrantDatasources: any = await qdrantClient.post(
        '/collections/text-embedding-ada-002/points/scroll',
        {
          offset: offset,
          limit: 1000,
          filter: {
            must: [
              {
                key: 'datastore_id',
                match: {
                  value: datastoreId,
                },
              },
            ],
          },
          with_payload: true,
          with_vector: false,
        }
      );

      qdrantDatasources?.data?.result?.points?.forEach((each: any) => {
        dsIdsOnQdrant.add(each?.payload?.datasource_id);
      });

      offset = qdrantDatasources?.data?.result?.next_page_offset;

      hasReachedEnd = !offset;
    }

    const dsIdsToDelete = Array.from(dsIdsOnQdrant).filter(
      (each) => !datasourceIds?.includes(each)
    );

    const finalVerif = await prisma.appDatasource.findMany({
      where: {
        id: {
          in: dsIdsToDelete,
        },
      },
    });
    if (finalVerif.length > 0) {
      console.log('FINAL VERIF SHOULD BE EQUAL TO 0');
      return;
    }

    console.log('Going to delete', dsIdsToDelete);

    // const manager = new DatastoreManager(datastore!);
    // for (const datasourceId of dsIdsToDelete) {
    //   console.log('deleting ...', datasourceId);
    //   await manager.remove(datasourceId);
    //   console.log('deleted', datasourceId);
    // }
  };

  //   await processDatatore(DATASTORE_ID);

  console.log('NB Datastore to process', datastores.length);
  pMap(
    datastores.map((each) => each.id),
    (id) => processDatatore(id),
    { concurrency: 1 }
  );
})();
