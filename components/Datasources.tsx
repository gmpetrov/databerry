import { Prisma } from '@prisma/client';
import axios from 'axios';
import React from 'react';
import useSWR from 'swr';

import DatasourceTable from '@app/components/DatasourceTable';
import { BulkDeleteDatasourcesSchema } from '@app/pages/api/datasources/bulk-delete';
import { getDatastore } from '@app/pages/api/datastores/[id]';
import { fetcher } from '@app/utils/swr-fetcher';

type Props = {
  datastoreId: string;
};

function Datasources(props: Props) {
  const getDatastoreQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastore>
  >(`/api/datastores/${props.datastoreId}`, fetcher, {
    refreshInterval: 5000,
  });

  const handleSynchDatasource = async (datasourceId: string) => {
    await axios.post(`/api/datasources/${datasourceId}/synch`);

    getDatastoreQuery.mutate();
  };

  const handleBulkDelete = async (datasourceIds: string[]) => {
    if (window.confirm('Are you sure you want to delete these datasources?')) {
      await axios.post('/api/datasources/bulk-delete', {
        ids: datasourceIds,
        datastoreId: getDatastoreQuery?.data?.id,
      } as BulkDeleteDatasourcesSchema);

      await getDatastoreQuery.mutate();
    }
  };

  if (!getDatastoreQuery.data && !Array.isArray(getDatastoreQuery.data)) {
    return null;
  }

  return (
    <DatasourceTable
      items={getDatastoreQuery?.data?.datasources}
      handleSynch={handleSynchDatasource}
      handleBulkDelete={handleBulkDelete}
    />
  );
}

export default Datasources;
