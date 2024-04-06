import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Typography from '@mui/joy/Typography';
import { useRouter } from 'next/router';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import { createDatastore } from '@app/pages/api/datastores';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import { QdrantSchema as Schema } from '@chaindesk/lib/types/models';
import { DatastoreType, Prisma } from '@chaindesk/prisma';
import Input from '@chaindesk/ui/Input';

import { DatastoreFormProps } from './types';

const DATASTORE_BASE_API = '/api/datastores';

export const UpsertDatastoreSchema = z.object({
  id: z.string().trim().optional(),
  type: z.nativeEnum(DatastoreType),
  config: z.object({}).optional(),
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isPublic: z.boolean().optional(),
});

export type UpsertDatastoreSchema = z.infer<typeof UpsertDatastoreSchema>;

type Props = DatastoreFormProps & {
  schema: any;
  children: React.ReactNode;
};

type Schema = z.infer<typeof Schema>;

export default function BaseForm(props: Props) {
  const datastoreId = props?.defaultValues?.id;

  const methods = useForm<Schema>({
    resolver: zodResolver(Schema),
    defaultValues: {
      type: DatastoreType.qdrant,
      ...props?.defaultValues,
      config: {},
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const uri = datastoreId
    ? `${DATASTORE_BASE_API}/${datastoreId}`
    : DATASTORE_BASE_API;
  const datastoreMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createDatastore>
  >(
    uri,
    generateActionFetcher(
      datastoreId ? HTTP_METHOD.PATCH : HTTP_METHOD.POST
    )<Schema>
  );

  const onSubmit = async (values: Schema) => {
    try {
      const datastore = await toast.promise(
        datastoreMutation.trigger(values as any),
        {
          loading: 'Updating...',
          success: 'Updated!',
          error: 'Something went wrong',
        }
      );

      if (datastore) {
        props?.onSubmitSuccess?.(datastore);
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  const onSubmitWrapper = (e: any) => {
    e.stopPropagation();

    handleSubmit(onSubmit)(e);
  };

  const networkError = datastoreMutation.error?.message;

  console.log('validation errors', errors);

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col w-full space-y-8"
        onSubmit={onSubmitWrapper}
      >
        {networkError && <Alert color="danger">{networkError}</Alert>}

        <Input
          label="Datastore Name"
          helperText="e.g.: Nuclear Fusion latest research papers"
          control={control as any}
          {...register('name')}
        />

        {/* <Input
          label="Description"
          helperText="Will be used to generate the ChatGPT plugin file"
          control={control as any}
          {...register('description')}
        /> */}

        {props.children}

        <div className="flex flex-row">
          <FormControl className="flex flex-row space-x-4">
            <Checkbox
              defaultChecked={!!props?.defaultValues?.isPublic}
              {...register('isPublic')}
            />
            <div className="flex flex-col">
              <FormLabel>Public</FormLabel>
              <Typography level="body-xs">
                When activated, your datastore will be available by anyone on
                the internet.{' '}
                {/* <Typography fontWeight={'bold'} color="primary">
                  Required for a public ChatGPT plugin.
                </Typography> */}
              </Typography>
            </div>
          </FormControl>
        </div>

        {/* <InputText
    label="Index Name (optional)"
    control={control}
    {...register('config.indexName')}
  />

  <InputText
    label="Region (optional)"
    control={control}
    {...register('config.region')}
  /> */}

        {props.customSubmitButton ? (
          React.createElement(props.customSubmitButton, {
            isLoading: datastoreMutation.isMutating,
          })
        ) : (
          <Button
            type="submit"
            variant="soft"
            size="md"
            loading={datastoreMutation.isMutating}
            {...props.submitButtonProps}
          >
            {props.submitButtonText || 'Submit'}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}
