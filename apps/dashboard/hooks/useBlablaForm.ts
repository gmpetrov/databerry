import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import { deleteForm, getForm } from '@app/pages/api/forms/[formId]';
import { updateForm } from '@app/pages/api/forms/[formId]/admin';

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

type GetBlablaformResponse = Prisma.PromiseReturnType<typeof getForm> & {};

export type UseBlablaFormQuery = SWRResponse<GetBlablaformResponse>;
export type UseBlablaFormMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof updateForm>
>;
export type UseBlablaFormDeleteMutation = SWRMutationResponse<
  Prisma.PromiseReturnType<typeof deleteForm>
>;

function useBlablaForm({ id }: Props) {
  const query = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
    id ? `/api/forms/${id}` : null,
    fetcher
  );

  const mutation = useSWRMutation<Prisma.PromiseReturnType<typeof updateForm>>(
    `/api/forms/${id}/admin`,
    generateActionFetcher(HTTP_METHOD.PATCH),
    {
      // onSuccess(data, key, config) {
      //   query.mutate();
      // },
    }
  );

  const deleteMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof deleteForm>
  >(`/api/forms/${id}`, generateActionFetcher(HTTP_METHOD.DELETE), {
    onSuccess(data, key, config) {
      query.mutate();
    },
  });

  return {
    query,
    mutation,
    deleteMutation,
  };
}

export default useBlablaForm;
