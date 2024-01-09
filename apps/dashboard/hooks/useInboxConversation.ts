import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import {
  getConversation,
  updateInboxConversation,
} from '@app/pages/api/logs/[id]';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { Prisma } from '@chaindesk/prisma';

type Props = {
  id?: string;
};

type GetInboxConversationResponse = Prisma.PromiseReturnType<
  typeof getConversation
> & {};

export type UseInboxConversationQuery =
  SWRResponse<GetInboxConversationResponse>;
export type UseInboxConversationMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof updateInboxConversation>
>;
// export type UseInboxConversationDeleteMutation = SWRMutationResponse<
//   Prisma.PromiseReturnType<typeof deleteInboxConversation>
// >;

function useInboxConversation({ id }: Props) {
  const query = useSWR<Prisma.PromiseReturnType<typeof getConversation>>(
    id ? `/api/logs/${id}` : null,
    fetcher
  );

  const mutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateInboxConversation>
    // any,
    // any,
    // UpdatateInbo
  >(id ? `/api/logs/${id}` : null, generateActionFetcher(HTTP_METHOD.PATCH));

  return {
    query,
    mutation,
    // deleteMutation,
  };
}

export default useInboxConversation;
