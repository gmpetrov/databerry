import { Prisma, ToolType } from '@prisma/client';
import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import { getAgent, updateAgent } from '@app/pages/api/agents/[id]';
import agentToolFormat, { NormalizedTool } from '@app/utils/agent-tool-format';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@app/utils/swr-fetcher';

type Props = {
  id?: string;
};

type GetAgentResponse = Prisma.PromiseReturnType<typeof getAgent> & {
  tools: NormalizedTool[];
};

export type UseAgentQuery = SWRResponse<GetAgentResponse>;
export type UseAgentMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof updateAgent>
>;

function useAgent({ id }: Props) {
  const query = useSWR<GetAgentResponse>(
    id ? `/api/agents/${id}` : null,
    (args: any) =>
      fetcher(args).then((data) => {
        return {
          ...data,
          tools: (data?.tools || [])?.map(agentToolFormat),
        };
      })
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
