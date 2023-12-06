import { useRouter } from 'next/router';
import useSWR from 'swr';

import { getDatastore } from '@app/pages/api/datastores/[id]';

import config from '@chaindesk/lib/config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { Prisma } from '@chaindesk/prisma';

type Props = {
  swrConfig?: {
    refreshInterval?: number;
  };
};

const useGetDatastoreQuery = (props: Props) => {
  const router = useRouter();
  const limit = Number(router.query.limit || config.datasourceTable.limit);
  const offset = Number(router.query.offset || 0);
  const search = (router.query.search || '') as string;
  const status = (router.query.status || '') as string;
  const type = (router.query.type || '') as string;
  const groupId = (router.query.groupId || '') as string;

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
