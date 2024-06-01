import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/joy/Box';
import React, {
  ComponentProps,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import toast from 'react-hot-toast';

import useBlablaForm, {
  UseBlablaFormDeleteMutation,
  UseBlablaFormMutation,
  UseBlablaFormQuery,
} from '@app/hooks/useBlablaForm';

import { CreateFormSchema, FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { Form, Prisma, PromptType } from '@chaindesk/prisma';
import AutoSaveForm from '@chaindesk/ui/AutoSaveForm';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import Loader from '@chaindesk/ui/Loader';

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

  const defaultValues = {
    name: query?.data?.name,
    draftConfig: query?.data?.draftConfig as FormConfigSchema,
    publishedConfig: query?.data?.publishedConfig as FormConfigSchema,
    ...props.defaultValues,
  };

  const methods = useForm<CreateFormSchema>({
    mode: 'onChange',
    // resolver: zodResolver(CreateFormSchema),
    resolver: async (data, context, options) => {
      // you can debug your validation schema here
      // console.log('formData', data);
      const validation = await zodResolver(CreateFormSchema)(
        data,
        context,
        options
      );
      console.log('validation result', validation);
      return validation;
    },
    defaultValues,
  });

  const onSubmit = useCallback(
    async (values: CreateFormSchema) => {
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
    },
    [setState, mutation.trigger, query.mutate, props?.onSubmitSucces]
  );

  useEffect(() => {
    if (query?.data && !hasLoadedOnce) {
      methods.reset(
        {
          ...(query.data as any),
        },
        {
          // keepDefaultValues: true,
          // keepValues: true,
          // keepDirty: false,
        }
      );
      setHasLoadedOnce(true);
    }
  }, [query?.data, hasLoadedOnce]);

  // Weired bug, without this, the form is valid after a second update
  // console.log('isValid', methods.formState.isValid);
  console.log('errors', methods.formState.errors);

  if (!hasLoadedOnce) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <AutoSaveForm defaultValues={defaultValues} onSubmit={onSubmit} />
      <Box
        className="flex flex-col w-full h-full"
        {...props.formProps}
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
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
