import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/joy/Box';
import debounce from 'p-debounce';
import React, {
  ComponentProps,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FormProvider,
  FormProviderProps,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import toast from 'react-hot-toast';
import { SWRResponse } from 'swr';

import useBlablaForm, {
  UseBlablaFormDeleteMutation,
  UseBlablaFormMutation,
  UseBlablaFormQuery,
} from '@app/hooks/useBlablaForm';
import useStateReducer from '@app/hooks/useStateReducer';

import {
  CUSTOMER_SUPPORT,
  CUSTOMER_SUPPORT_V3,
} from '@chaindesk/lib/prompt-templates';
import { CreateFormSchema, FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { Form, Prisma, PromptType } from '@chaindesk/prisma';

// interface ConnectFormProps<TFieldValues extends FieldValues> {
//   children(children: UseFormReturn<TFieldValues>): ReactElement;
// }

type Props = {
  formId: string;
  defaultValues?: Partial<CreateFormSchema>;
  onSubmitSucces?: (agent: Form) => any;
  formProps?: ComponentProps<typeof Box>;
  children(children: {
    query: UseBlablaFormQuery;
    mutation: UseBlablaFormMutation;
    deleteMutation: UseBlablaFormDeleteMutation;
    methods: UseFormReturn<CreateFormSchema>;
  }): ReactElement;
  refreshQueryAfterMutation?: boolean;
};

function BlablaFormForm(props: Props) {
  const [state, setState] = useStateReducer({
    isLoading: false,
  });

  const formId = props?.formId;
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { query, mutation, deleteMutation } = useBlablaForm({ id: formId });

  const methods = useForm<CreateFormSchema>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: {
      name: query?.data?.name,
      draftConfig: query?.data?.draftConfig as FormConfigSchema,
      publishedConfig: query?.data?.publishedConfig as FormConfigSchema,
      ...props.defaultValues,
    },
  });

  const onSubmit = useCallback(
    debounce(async (values: CreateFormSchema) => {
      try {
        setState({ isLoading: true });
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

        props?.onSubmitSucces?.(form as Form);
      } catch (err) {
        console.log('error', err);
      } finally {
        setState({ isLoading: false });
      }
    }, 1000),
    [setState, mutation.trigger, query.mutate, props?.onSubmitSucces]
  );

  useEffect(() => {
    if (query?.data && !hasLoadedOnce) {
      methods.reset(
        {
          ...(query.data as any),
        },
        {
          keepDirtyValues: true,
          keepDefaultValues: true,
        }
      );
      setHasLoadedOnce(true);
    }
  }, [query?.data, hasLoadedOnce]);

  // useEffect(() => {
  //   const subscription = watch(() => {
  //     if (isDirty) {
  //       handleSubmit(onSubmit)();
  //     }
  //   });
  //   return () => subscription.unsubscribe();
  // }, [isDirty, watch, handleSubmit, onSubmit]);

  // Weired bug, without this, the form is valid after a second update
  // console.log('isValid', methods.formState.isValid);
  console.log('errors', methods.formState.errors);
  // console.log('dirtyFields', methods.formState.dirtyFields);

  return (
    <FormProvider {...methods}>
      <Box
        className="flex flex-col w-full h-full"
        {...props.formProps}
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        onChange={methods.handleSubmit(onSubmit)}
      >
        {props.children({
          query,
          mutation,
          methods,
          deleteMutation,
        })}

        <button
          id="blablaform-form-submit"
          type="submit"
          hidden
          style={{ width: 0, height: 0 }}
        />
      </Box>
    </FormProvider>
  );
}

export default BlablaFormForm;
