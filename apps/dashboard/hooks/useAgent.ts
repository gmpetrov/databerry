import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import { getAgent, updateAgent } from '@app/pages/api/agents/[id]';

import agentToolFormat from '@chaindesk/lib/agent-tool-format';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { ToolSchema } from '@chaindesk/lib/types/dtos';
import { Datastore, Prisma, Tool, ToolType } from '@chaindesk/prisma';

type Props = {
  id?: string;
};

type GetAgentResponse = Prisma.PromiseReturnType<typeof getAgent> & {
  tools: (Tool &
    ToolSchema & {
      datastore: Datastore | null;
    })[];
};

export type UseAgentQuery = SWRResponse<GetAgentResponse>;
export type UseAgentMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof updateAgent>
>;

function useAgent({ id }: Props) {
  const query = useSWR<GetAgentResponse>(
    id ? `/api/agents/${id}` : null,
    fetcher
    // (args: any) =>
    //   fetcher(args).then((data) => {
    //     return {
    //       ...data,
    //       tools: (data?.tools || [])?.map(agentToolFormat),
    //     };
    //   })
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
