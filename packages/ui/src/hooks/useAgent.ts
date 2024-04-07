import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { GetAgentResponse, ToolSchema } from '@chaindesk/lib/types/dtos';
import { Datastore, Prisma, Tool, ToolType } from '@chaindesk/prisma';

type Props = {
  id?: string;
};

type GetAgentResponseExtended = GetAgentResponse & {
  tools: (Tool &
    ToolSchema & {
      datastore: Datastore | null;
    })[];
};

export type UseAgentQuery = SWRResponse<GetAgentResponseExtended>;
export type UseAgentMutation = SWRMutationResponse<GetAgentResponseExtended>;
const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

function useAgent({ id }: Props) {
  const query = useSWR<GetAgentResponseExtended>(
    id ? `${API_URL}/api/agents/${id}` : null,
    fetcher
    // (args: any) =>
    //   fetcher(args).then((data) => {
    //     return {
    //       ...data,
    //       tools: (data?.tools || [])?.map(agentToolFormat),
    //     };
    //   })
  );

  const mutation = useSWRMutation<GetAgentResponseExtended>(
    id ? `${API_URL}/api/agents/${id}` : `${API_URL}/api/agents`,
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
