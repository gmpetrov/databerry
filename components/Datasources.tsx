import axios from 'axios';
import { useSession } from 'next-auth/react';
import React from 'react';

import DatasourceTable from '@app/components/DatasourceTable';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import { BulkDeleteDatasourcesSchema } from '@app/pages/api/datasources/bulk-delete';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';

import UsageLimitModal from './UsageLimitModal';

type Props = {
  datastoreId: string;
};

function Datasources(props: Props) {
  const { data: session, status } = useSession();
  const [isUsageModalOpen, setIsUsageModalOpen] = React.useState(false);

  const { getDatastoreQuery } = useGetDatastoreQuery({
    swrConfig: {
      refreshInterval: 5000,
    },
  });

  const handleSynchDatasource = async (datasourceId: string) => {
    try {
      guardDataProcessingUsage({
        usage: session?.user.usage!,
        plan: session?.user.currentPlan!,
      });
    } catch {
      return setIsUsageModalOpen(true);
    }

    await axios.post(`/api/datasources/${datasourceId}/synch`);

    await getDatastoreQuery.mutate();
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
    <>
      <DatasourceTable
        handleSynch={handleSynchDatasource}
        handleBulkDelete={handleBulkDelete}
      />

      <UsageLimitModal
        isOpen={isUsageModalOpen}
        handleClose={() => {
          setIsUsageModalOpen(false);
        }}
      />
    </>
  );
}

export default Datasources;
