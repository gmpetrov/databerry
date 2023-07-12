import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button } from '@mui/joy';
import Textarea from '@mui/joy/Textarea';
import {
  AppDatasource as Datasource,
  DatasourceType,
  Prisma,
} from '@prisma/client';
import axios from 'axios';
import mime from 'mime-types';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import Input from '@app/components/Input';
import { upsertDatasource } from '@app/pages/api/datasources';
import { GenerateUploadLinkRequest } from '@app/types/dtos';
import { UpsertDatasourceSchema } from '@app/types/models';
import cuid from '@app/utils/cuid';
import getS3RootDomain from '@app/utils/get-s3-root-domain';
import { fetcher, postFetcher } from '@app/utils/swr-fetcher';

import type { DatasourceFormProps } from './types';

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
      ? `${getS3RootDomain()}/datastores/${props?.datastoreId}/${
          props?.datasourceId
        }/data.json`
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
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      const datasourceText = !dirtyFields['datasourceText']
        ? undefined
        : values.datasourceText;

      const payload = {
        id: cuid(),
        ...values,
        isUpdateText: !!datasourceText,
        file: undefined,
      } as UpsertDatasourceSchema;

      if (
        datasourceText ||
        payload.type === DatasourceType.text ||
        payload.type === DatasourceType.file
      ) {
        let type = '';
        let fileName = '';
        let file: File;

        if (datasourceText || payload.type === DatasourceType.text) {
          type = 'text/plain';
          fileName = `${payload.id}/${payload.id}.txt`;
          file = new File([datasourceText!], fileName, { type });

          // Treat text as file
          payload['type'] = DatasourceType.file;
          payload['config'] = {
            ...values.config,
            fileSize: file.size,
            type,
          };
        } else {
          type = (values as any).file.type as string;
          fileName = `${payload.id}/${payload.id}.${mime.extension(type)}`;
          file = (values as any)?.file as File;
        }

        // upload text from file to AWS
        const uploadLinkRes = await axios.post(
          `/api/datastores/${props.defaultValues?.datastoreId}/generate-upload-link`,
          {
            fileName,
            type,
          } as GenerateUploadLinkRequest
        );

        await axios.put(uploadLinkRes.data, file, {
          headers: {
            'Content-Type': type,
          },
        });
      }

      // const check = await axios.post('/api/datasources/check', payload);

      // if (!check?.data?.valid) {
      //   alert(check?.data?.message);
      //   return;
      // }

      const datasource = await upsertDatasourceMutation.trigger(payload as any);

      props?.onSubmitSuccess?.(datasource!);
    } catch (err) {
      console.log('error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitWrapper = (e: any) => {
    e.stopPropagation();

    handleSubmit(onSubmit)(e);
  };

  const networkError = upsertDatasourceMutation.error?.message;

  console.log('validation errors', methods.formState.errors);

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col w-full space-y-6"
        onSubmit={onSubmitWrapper}
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
            isLoading: isLoading || upsertDatasourceMutation.isMutating,
          })
        ) : (
          <Button
            type="submit"
            variant="soft"
            color="primary"
            loading={isLoading || upsertDatasourceMutation.isMutating}
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
