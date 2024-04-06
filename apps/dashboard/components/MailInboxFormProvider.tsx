import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/joy/Box';
import axios from 'axios';
import debounce from 'p-debounce';
import React, {
  ComponentProps,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import toast from 'react-hot-toast';

import useMailInbox, {
  UseMailInboxDeleteMutation,
  UseMailInboxMutation,
  UseMailInboxQuery,
} from '@app/hooks/useMailInbox';
import useRefinement, { Refinement } from '@app/hooks/useRefinements';

import {
  EmailAliasSchema,
  UpdateMailInboxSchema,
} from '@chaindesk/lib/types/dtos';
import { MailInbox, Prisma } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

// interface ConnectFormProps<TFieldValues extends FieldValues> {
//   children(children: UseFormReturn<TFieldValues>): ReactElement;
// }

type Props = {
  inboxId: string;
  defaultValues?: Partial<UpdateMailInboxSchema>;
  onSubmitSucces?: (agent: MailInbox) => any;
  formProps?: ComponentProps<typeof Box>;
  children(children: {
    query: UseMailInboxQuery;
    mutation: UseMailInboxMutation;
    deleteMutation: UseMailInboxDeleteMutation;
    methods: UseFormReturn<UpdateMailInboxSchema>;
    refinement?: Refinement<UpdateMailInboxSchema>;
  }): ReactElement;
  refreshQueryAfterMutation?: boolean;
};

const checkAliasUnique = async (values: UpdateMailInboxSchema) => {
  try {
    const alias = await EmailAliasSchema.parseAsync(values.alias);

    const { data } = await axios.post(
      `/api/mail-inboxes/check-alias-availability`,
      {
        alias,
      }
    );

    return !!data.available;
  } catch (err) {
    return false;
  }
};

function MailInboxFormProvider(props: Props) {
  // const refinement = useRefinement(checkAliasUnique, {
  //   debounce: 1000,
  // });

  const inboxId = props?.inboxId;

  const { query, mutation, deleteMutation } = useMailInbox({ id: inboxId });

  const methods = useForm<UpdateMailInboxSchema>({
    // mode: 'all',
    resolver: zodResolver(UpdateMailInboxSchema),
    defaultValues: {
      ...props.defaultValues,
    },
  });

  const onSubmit = useCallback(
    async (values: UpdateMailInboxSchema) => {
      if (methods.formState.isValidating || !methods.formState.isDirty) {
        return;
      }
      try {
        if (!!methods.formState.dirtyFields.alias) {
          const { data } = await axios.post(
            `/api/mail-inboxes/check-alias-availability`,
            {
              alias: values.alias,
            }
          );

          if (!data.available) {
            return toast.error('Alias is already taken');
          }
        }

        const form = await toast.promise(
          mutation.trigger({
            ...values,
          } as any),
          {
            loading: 'Saving...',
            success: 'Saved',
            error: 'Something went wrong',
          },
          {
            id: 'blablaform-update',
            position: 'top-center',
          }
        );

        if (props?.refreshQueryAfterMutation) {
          query.mutate();
        }

        props?.onSubmitSucces?.(form!);
      } catch (err) {
        console.log('error', err);
      } finally {
      }
    },
    [
      mutation.trigger,
      query.mutate,
      props?.onSubmitSucces,
      methods.formState.isValidating,
      methods.formState.isDirty,
    ]
  );

  const debounced = useCallback(
    debounce(methods.handleSubmit(onSubmit), 1500),
    []
  );

  useEffect(() => {
    if (query?.data) {
      methods.reset(
        {
          ...(query.data as any),
        },
        {
          keepDirty: false,
          // keepDirtyValues: false,
          // keepValues: true,
          // keepDefaultValues: true,
        }
      );
    }
  }, [query?.data]);

  console.log('errors', methods.formState.errors);

  useEffect(() => {
    if (
      methods.formState.isDirty &&
      methods.formState.isValid &&
      !methods.formState.isValidating
    ) {
      debounced();
    }
  }, [
    methods.formState.isDirty,
    methods.formState.isValid,
    methods.formState.isValidating,
    debounced,
  ]);

  return (
    <FormProvider {...methods}>
      <Box
        className="flex flex-col w-full h-full"
        {...props.formProps}
        component="form"
      >
        {props.children({
          query,
          mutation,
          methods,
          deleteMutation,
          // refinement,
        })}
      </Box>
    </FormProvider>
  );
}

export default MailInboxFormProvider;
