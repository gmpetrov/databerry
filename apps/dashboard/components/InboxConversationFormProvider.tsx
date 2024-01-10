import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/joy/Box';
import debounce from 'p-debounce';
import React, {
  ComponentProps,
  ReactElement,
  useCallback,
  useEffect,
} from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import toast from 'react-hot-toast';

import useInboxConversation, {
  UseInboxConversationDeleteMutation,
  UseInboxConversationMutation,
  UseInboxConversationQuery,
} from '@app/hooks/useInboxConversation';

import { UpdateInboxConversationSchema } from '@chaindesk/lib/types/dtos';
import { Conversation, Prisma } from '@chaindesk/prisma';

type Props = {
  id: string;
  defaultValues?: Partial<UpdateInboxConversationSchema>;
  onSubmitSucces?: (conversation: Conversation) => any;
  formProps?: ComponentProps<typeof Box>;
  children(children: {
    query: UseInboxConversationQuery;
    mutation: UseInboxConversationMutation;
    deleteMutation: UseInboxConversationDeleteMutation;
    methods: UseFormReturn<UpdateInboxConversationSchema>;
  }): ReactElement;
  refreshQueryAfterMutation?: boolean;
};

function InboxConversationProvider(props: Props) {
  const inboxId = props?.id;

  const { query, mutation, deleteMutation } = useInboxConversation({
    id: inboxId,
  });

  const methods = useForm<UpdateInboxConversationSchema>({
    // mode: 'all',
    resolver: zodResolver(UpdateInboxConversationSchema),
    defaultValues: {
      ...props.defaultValues,
    },
  });

  const onSubmit = useCallback(
    async (values: UpdateInboxConversationSchema) => {
      if (methods.formState.isValidating || !methods.formState.isDirty) {
        return;
      }
      try {
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
            id: 'conversation-update',
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

  const submit = useCallback(
    methods.handleSubmit(onSubmit),
    // debounce(methods.handleSubmit(onSubmit), 1500),
    []
  );

  useEffect(() => {
    if (query?.data) {
      methods.reset(
        {
          ...(query.data as any),
          assignees: query?.data?.assignees?.map((each) => each.id) || [],
        },
        {
          keepDirty: false,
        }
      );
    }
  }, [query?.data]);

  // console.log('dirtyFields', methods.formState.dirtyFields);
  // console.log('isValid', methods.formState.isValid);
  console.log('errors', methods.formState.errors);

  useEffect(() => {
    if (
      methods.formState.isDirty &&
      methods.formState.isValid &&
      !methods.formState.isValidating
    ) {
      submit();
    }
  }, [
    methods.formState.isDirty,
    methods.formState.isValid,
    methods.formState.isValidating,
    submit,
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

export default InboxConversationProvider;
