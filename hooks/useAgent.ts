import { Prisma } from '@prisma/client';
import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import { getAgent, updateAgent } from '@app/pages/api/agents/[id]';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@app/utils/swr-fetcher';

type Props = {
  id?: string;
};

export type UseAgentQuery = SWRResponse<
  Prisma.PromiseReturnType<typeof getAgent>
>;
export type UseAgentMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof updateAgent>
>;

function useAgent({ id }: Props) {
  const query = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    id ? `/api/agents/${id}` : null,
    fetcher
  );

  const mutation = useSWRMutation<Prisma.PromiseReturnType<typeof updateAgent>>(
    id ? `/api/agents/${id}` : `/api/agents`,
    generateActionFetcher(id ? HTTP_METHOD.PATCH : HTTP_METHOD.POST),
    {
      onSuccess(data, key, config) {
        query.mutate();
      },
    }
  );

  return {
    query,
    mutation,
  };
}

export default useAgent;
