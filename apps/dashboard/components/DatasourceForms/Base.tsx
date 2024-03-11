import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Option, Select, Stack } from '@mui/joy';
import { FormLabel } from '@mui/joy';
import Textarea from '@mui/joy/Textarea';
import axios from 'axios';
import cuid from 'cuid';
import mime from 'mime-types';
import React, { useEffect, useState } from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  ValidationMode,
} from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import Input from '@app/components/Input';
import { upsertDatasource } from '@app/pages/api/datasources';

import getS3RootDomain from '@chaindesk/lib/get-s3-root-domain';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { GenerateUploadLinkRequest } from '@chaindesk/lib/types/dtos';
import { DatasourceSchema } from '@chaindesk/lib/types/models';
import {
  AppDatasource as Datasource,
  DatasourceType,
  Prisma,
} from '@chaindesk/prisma';

import DatasourceTagsInput from '../DatasourceTagsInput';

import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {
  schema: any;
  children?: React.ReactNode;
  mode?: keyof ValidationMode;
  hideName?: boolean;
  hideText?: boolean;
};

const DatasourceText = (props: {
  datasourceId?: string;
  datastoreId: string;
  disabled?: boolean;
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
      // maxRows={21}
      minRows={4}
      disabled={props.disabled}
      {...methods.register('datasourceText')}
      onChange={(e) => {
        methods.setValue('datasourceText', e.target.value, {
          shouldDirty: true,
        });
      }}
    />
  );
};

export default function BaseForm(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm<DatasourceSchema>({
    resolver: zodResolver(props.schema),
    mode: props.mode,
    defaultValues: {
      ...props?.defaultValues,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, defaultValues, isDirty, dirtyFields, isValid },
  } = methods;

  const upsertDatasourceMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof upsertDatasource>
  >(
    `/api/datasources`,
    generateActionFetcher(HTTP_METHOD.POST)<DatasourceSchema>
  );

  const onSubmit = async (values: DatasourceSchema) => {
    try {
      setIsLoading(true);
      const datasourceText = !dirtyFields['datasourceText']
        ? undefined
        : values.datasourceText;

      const payload = {
        id: cuid(),
        ...values,
        config: {
          ...defaultValues?.config,
          ...values?.config,
        },
        isUpdateText: !!datasourceText,
        file: undefined,
      } as DatasourceSchema;

      if (
        datasourceText ||
        payload.type === DatasourceType.text ||
        payload.type === DatasourceType.file
      ) {
        let mime_type = '';
        let fileName = '';
        let file = undefined as File | undefined;

        if (datasourceText || payload.type === DatasourceType.text) {
          mime_type = 'text/plain';
          fileName = `${payload.id}/${payload.id}.txt`;
          file = new File([datasourceText!], fileName, { type: mime_type });

          // Treat text as file
          payload['type'] = DatasourceType.file;
          payload['config'] = {
            ...values.config,
            fileSize: file.size,
            mime_type,
          };
        } else if ((values as any).file.type) {
          mime_type = (values as any).file.type as string;
          fileName = `${payload.id}/${payload.id}.${mime.extension(mime_type)}`;
          file = (values as any)?.file as File;
        }

        if (file) {
          // upload text from file to AWS
          const uploadLinkRes = await axios.post(
            `/api/datastores/${props.defaultValues?.datastoreId}/generate-upload-link`,
            {
              fileName,
              type: mime_type,
            } as GenerateUploadLinkRequest
          );

          await axios.put(uploadLinkRes.data, file, {
            headers: {
              'Content-Type': mime_type,
            },
          });
        }
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
          hidden={props.hideName}
          {...register('name')}
        />

        {props?.defaultValues?.type &&
          [DatasourceType.file, DatasourceType.text].includes(
            props.defaultValues.type as any
          ) && (
            <Input
              label="Source URL (optional)"
              control={control as any}
              placeholder="https://en.wikipedia.org/wiki/Nuclear_fusion"
              helperText='The URL to use for the "sources" section of an Agent answer'
              {...register('config.source_url')}
            />
          )}

        {props.children}

        <details>
          <summary>Advanced Settings</summary>

          <Stack sx={{ pl: 2, pt: 2 }}>
            <DatasourceTagsInput />
          </Stack>
        </details>

        {!props.hideText && defaultValues?.datastoreId && defaultValues?.id && (
          <details>
            <summary>Extracted Text</summary>
            <DatasourceText
              datastoreId={defaultValues?.datastoreId}
              datasourceId={defaultValues?.id}
              disabled={
                defaultValues.type !== DatasourceType.text &&
                (defaultValues as any)?.config?.mime_type !== 'text/plain'
              }
            />
          </details>
        )}

        {props?.customSubmitButton ? (
          React.createElement(props.customSubmitButton, {
            isLoading: isLoading || upsertDatasourceMutation.isMutating,
            disabled: !isDirty || !isValid,
          })
        ) : (
          <Button
            type="submit"
            variant="soft"
            color="primary"
            loading={isLoading || upsertDatasourceMutation.isMutating}
            disabled={!isDirty || !isValid}
            {...props.submitButtonProps}
          >
            {props.submitButtonText || 'Submit'}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}
