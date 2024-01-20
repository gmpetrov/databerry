import { useRouter } from 'next/router';
import useSWR from 'swr';

import config from '@chaindesk/lib/config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { Prisma } from '@chaindesk/prisma';

type Props = {
  swrConfig?: {
    refreshInterval?: number;
  };
  baseEndpoint: string;
  path?: string[];
  filters: string[];
  tableType?: Exclude<keyof typeof config, 'defaultDatasourceChunkSize'>;
};

function usePaginatedQuery<
  TFetcher extends (...args: any) => Promise<any> = (
    ...args: any
  ) => Promise<any>
>(props: Props) {
  const router = useRouter();
  const limit =
    router.query.limit ||
    config[`${props?.tableType || 'defaultTable'}`]?.limit;

  const offset = router.query.offset || '0';

  let endpoint = props.baseEndpoint.endsWith('/')
    ? props.baseEndpoint
    : `${props.baseEndpoint}/`;

  if (props.path) {
    endpoint += props.path
      .filter((subPath) => router.query[subPath] !== undefined)
      .map((subPath) => router.query[subPath])
      .join('/');
  }

  const filterValues = props.filters.reduce(
    (result, filter) => {
      if (router.query[filter] !== undefined) {
        result[filter] = router.query[filter] as string;
      }

      return result;
    },
    { offset, limit } as Record<string, string>
  );

  endpoint += `?${new URLSearchParams(filterValues)}`;

  console.log(endpoint);
  const getPagniatedQuery = useSWR<Prisma.PromiseReturnType<TFetcher>>(
    endpoint,
    fetcher,
    {
      ...props.swrConfig,
    }
  );

  return {
    getPagniatedQuery,
    limit: Number(limit),
    offset: Number(offset),
    filterValues,
  };
}

export default usePaginatedQuery;
