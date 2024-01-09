import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import {
  deleteMailInbox,
  getMailInbox,
  updateMailInbox,
} from '@app/pages/api/mail-inboxes/[id]';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { UpdateMailInboxSchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';

type Props = {
  id?: string;
};

type GetMailInboxResponse = Prisma.PromiseReturnType<typeof getMailInbox> & {};

export type UseMailInboxQuery = SWRResponse<GetMailInboxResponse>;
export type UseMailInboxMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof updateMailInbox>
>;
export type UseMailInboxDeleteMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof deleteMailInbox>
>;

function useMailInbox({ id }: Props) {
  const query = useSWR<Prisma.PromiseReturnType<typeof getMailInbox>>(
    id ? `/api/mail-inboxes/${id}` : null,
    fetcher
  );

  const mutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateMailInbox>
    // any,
    // any,
    // UpdateMailInboxSchema
  >(
    id ? `/api/mail-inboxes/${id}` : null,
    generateActionFetcher(HTTP_METHOD.PATCH),
    {
      onSuccess(data, key, config) {
        // query.mutate();
      },
    }
  );

  const deleteMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof deleteMailInbox>
  >(
    id ? `/api/mail-inboxes/${id}` : null,
    generateActionFetcher(HTTP_METHOD.DELETE),
    {
      onSuccess(data, key, config) {
        query.mutate();
      },
    }
  );

  return {
    query,
    mutation,
    deleteMutation,
  };
}

export default useMailInbox;
