import { Prisma } from '@prisma/client';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { getDatastore } from '@app/pages/api/datastores/[id]';
import config from '@app/utils/config';
import { fetcher } from '@app/utils/swr-fetcher';

type Props = {
  swrConfig?: {
    refreshInterval?: number;
  };
};

const useGetDatastoreQuery = (props: Props) => {
  const router = useRouter();
  const limit = Number(router.query.limit || config.datasourceTable.limit);
  const offset = Number(router.query.offset || 0);
  const search = router.query.search || '';
  const status = router.query.status || '';
  const type = router.query.type || '';
  const groupId = router.query.groupId || '';

  const getDatastoreQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastore>
  >(
    `/api/datastores/${router.query?.datastoreId}?offset=${offset}&limit=${limit}&search=${search}&status=${status}&groupId=${groupId}&type=${type}`,
    fetcher,
    {
      ...props.swrConfig,
    }
  );

  return {
    getDatastoreQuery,
    limit,
    offset,
    search,
    status,
    type,
    groupId,
  };
};

export default useGetDatastoreQuery;
