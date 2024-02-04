import { zodResolver } from '@hookform/resolvers/zod';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { Alert, Button, Stack } from '@mui/joy';
import React, { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { LeadCaptureToolchema, ToolSchema } from '@chaindesk/lib/types/dtos';

import LeadCaptureToolFormInput from './LeadCaptureToolFormInput';
type Props = {
  defaultValues?: Partial<LeadCaptureToolchema>;
  onSubmit?: (data: LeadCaptureToolchema) => any;
};

function LeadCaptureToolForm({ onSubmit, defaultValues }: Props) {
  const methods = useForm<LeadCaptureToolchema>({
    resolver: zodResolver(
      ToolSchema.refine(
        (val) => {
          const values = val as LeadCaptureToolchema;

          return (
            !!values.config.isEmailEnabled ||
            !!values.config.isPhoneNumberEnabled
          );
        },
        {
          message: 'At least one of email of phone number must be enabled',
          path: ['config.isEmailEnabled'],
        }
      )
    ),
    mode: 'onChange',
    defaultValues: {
      ...defaultValues,
      type: 'lead_capture',
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

  const error = methods.formState.errors?.config?.isEmailEnabled?.message;

  return (
    <FormProvider {...methods}>
      <Stack component="form" onSubmit={handleSubmit} gap={2}>
        <LeadCaptureToolFormInput />

        {error && (
          <Alert startDecorator={<ErrorRoundedIcon />} color="danger">
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          color="success"
          disabled={!methods.formState.isDirty || !methods.formState.isValid}
        >
          Create
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default LeadCaptureToolForm;
