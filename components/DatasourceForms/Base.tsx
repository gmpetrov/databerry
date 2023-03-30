import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button } from '@mui/joy';
import Textarea from '@mui/joy/Textarea';
import {
  AppDatasource as Datasource,
  DatasourceType,
  Prisma,
} from '@prisma/client';
import axios from 'axios';
import React, { useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import Input from '@app/components/Input';
import { upsertDatasource } from '@app/pages/api/datasources';
import { fetcher, postFetcher } from '@app/utils/swr-fetcher';

import type { DatasourceFormProps } from './types';

export const UpsertDatasourceSchema = z.object({
  id: z.string().trim().cuid().optional(),
  type: z.nativeEnum(DatasourceType),
  name: z.string().trim().optional(),
  datastoreId: z.string().trim().cuid(),
  datasourceText: z.string().optional(),
  config: z.object({}),
});

export type UpsertDatasourceSchema = z.infer<typeof UpsertDatasourceSchema>;

type Props = DatasourceFormProps & {
  schema: any;
  children: React.ReactNode;
};

const DatasourceText = (props: {
  datasourceId?: string;
  datastoreId: string;
}) => {
  const methods = useFormContext();

  const query = useSWR(
    props?.datasourceId
      ? `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/datastores/${props?.datastoreId}/${props?.datasourceId}.json`
      : null,
    fetcher
  );

  useEffect(() => {
    if (query.data?.text) {
      methods.reset({
        ...methods.formState.defaultValues,
        datasourceText: query.data?.text,
      });
    }
  }, [query.data?.text]);

  if (!query?.data?.text) {
    return null;
  }

  return (
    <Textarea
      maxRows={21}
      minRows={4}
      {...methods.register('datasourceText')}
    />
  );
};

export default function BaseForm(props: Props) {
  const methods = useForm<UpsertDatasourceSchema>({
    resolver: zodResolver(props.schema),
    defaultValues: {
      ...props?.defaultValues,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, defaultValues, isDirty, dirtyFields },
  } = methods;

  const upsertDatasourceMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof upsertDatasource>
  >(`/api/datasources`, postFetcher<UpsertDatasourceSchema>);

  const onSubmit = async (values: UpsertDatasourceSchema) => {
    try {
      const datasourceText = !dirtyFields['datasourceText']
        ? undefined
        : values.datasourceText;

      const payload = {
        ...values,
        datasourceText,
      } as any;

      const check = await axios.post('/api/datasources/check', values);

      if (!check?.data?.valid) {
        alert(check?.data?.message);
        return;
      }

      const datasource = await upsertDatasourceMutation.trigger(payload);

      props?.onSubmitSuccess?.(datasource!);
    } catch (err) {
      console.log('error', err);
    }
  };

  const networkError = upsertDatasourceMutation.error?.message;

  console.log('validation errors', methods.formState.errors);

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col w-full space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {networkError && <Alert color="danger">{networkError}</Alert>}

        <Input
          label="Name (optional)"
          control={control as any}
          {...register('name')}
        />

        {props.children}

        {defaultValues?.datastoreId && (
          <DatasourceText
            datastoreId={defaultValues?.datastoreId}
            datasourceId={defaultValues?.id}
          />
        )}

        {props?.customSubmitButton ? (
          React.createElement(props.customSubmitButton, {
            isLoading: upsertDatasourceMutation.isMutating,
          })
        ) : (
          <Button
            type="submit"
            variant="soft"
            color="primary"
            loading={upsertDatasourceMutation.isMutating}
            disabled={!isDirty}
            {...props.submitButtonProps}
          >
            {props.submitButtonText || 'Submit'}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}
