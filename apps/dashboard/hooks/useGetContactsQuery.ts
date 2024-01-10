import { useRouter } from 'next/router';
import useSWR from 'swr';

import { getContacts } from '@app/pages/api/contacts';

import config from '@chaindesk/lib/config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { Prisma } from '@chaindesk/prisma';

type Props = {
  swrConfig?: {
    refreshInterval?: number;
  };
};

const useContactsQuery = (props: Props) => {
  const router = useRouter();
  const limit = Number(router.query.limit || config.datasourceTable.limit);
  const offset = Number(router.query.offset || 0);
  const search = (router.query.search || '') as string;

  const contactsQuery = useSWR<Prisma.PromiseReturnType<typeof getContacts>>(
    `/api/contacts?offset=${offset}&limit=${limit}&search=${search}`,
    fetcher,
    {
      ...props.swrConfig,
    }
  );

  return {
    contactsQuery,
    limit,
    offset,
    search,
  };
};

export default useContactsQuery;
