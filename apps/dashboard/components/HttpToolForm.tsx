import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack } from '@mui/joy';
import React, { useCallback } from 'react';
import {
  Control,
  FieldValue,
  FieldValues,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import z from 'zod';

import { HttpToolSchema, ToolSchema } from '@chaindesk/lib/types/dtos';

import HttpToolInput from './AgentInputs/HttpToolInput';
import Input from './Input';

type Props = {
  defaultValues?: Partial<HttpToolSchema>;
  onSubmit?: (data: HttpToolSchema) => any;
};

function HttpToolForm({ onSubmit, defaultValues }: Props) {
  const methods = useForm<HttpToolSchema>({
    resolver: zodResolver(ToolSchema),
    mode: 'onChange',
    defaultValues: {
      ...defaultValues,
      type: 'http',
    },
  });

  console.log('ERRORS', methods.formState.errors);
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      methods.handleSubmit((data) => {
        onSubmit?.(data);
      })(e);
    },
    [onSubmit]
  );

  return (
    <FormProvider {...methods}>
      <Stack component="form" onSubmit={handleSubmit} gap={2}>
        <HttpToolInput />

        <Button type="submit" color="success">
          Create
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default HttpToolForm;
