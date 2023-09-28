import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/joy/Box';
import { Agent, Prisma, PromptType } from '@prisma/client';
import React, { ComponentProps, ReactElement, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { SWRResponse } from 'swr';

import useAgent, { UseAgentMutation, UseAgentQuery } from '@app/hooks/useAgent';
import useStateReducer from '@app/hooks/useStateReducer';
import { CreateAgentSchema } from '@app/types/dtos';
import { CUSTOMER_SUPPORT } from '@app/utils/prompt-templates';

// interface ConnectFormProps<TFieldValues extends FieldValues> {
//   children(children: UseFormReturn<TFieldValues>): ReactElement;
// }

type Props = {
  agentId?: string;
  defaultValues?: Partial<CreateAgentSchema>;
  onSubmitSucces?: (agent: Agent) => any;
  formProps?: ComponentProps<typeof Box>;
  children(children: {
    query: UseAgentQuery;
    mutation: UseAgentMutation;
  }): ReactElement;
};

function AgentForm(props: Props) {
  const [state, setState] = useStateReducer({
    isLoading: false,
  });

  const agentId = props?.agentId;

  const { query, mutation } = useAgent({ id: agentId });

  const methods = useForm<CreateAgentSchema>({
    resolver: zodResolver(CreateAgentSchema),
    defaultValues: {
      promptType: PromptType.customer_support,
      prompt: CUSTOMER_SUPPORT,
      includeSources: true,
      ...props?.defaultValues,
    },
  });

  const onSubmit = async (values: CreateAgentSchema) => {
    try {
      setState({ isLoading: true });
      console.log('values', values);
      const agent = await toast.promise(
        mutation.trigger({
          ...values,
        } as any),
        {
          loading: 'Updating...',
          success: 'Updated!',
          error: 'Something went wrong',
        }
      );
      props?.onSubmitSucces?.(agent as Agent);
    } catch (err) {
      console.log('error', err);
    } finally {
      setState({ isLoading: false });
    }
  };

  useEffect(() => {
    if (query?.data) {
      methods.reset({
        ...(query.data as any),
      });
    }
  }, [query?.data]);

  // Weired bug, without this, the form is valid after a second update
  console.log('isValid', methods.formState.isValid);

  return (
    <FormProvider {...methods}>
      <Box
        className="flex flex-col w-full h-full"
        {...props.formProps}
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {props.children({
          query,
          mutation,
        })}
      </Box>
    </FormProvider>
  );
}

export default AgentForm;
