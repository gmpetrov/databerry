import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Typography from '@mui/joy/Typography';
import { DatastoreType, Prisma } from '@prisma/client';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import Input from '@app/components/Input';
import { createDatastore } from '@app/pages/api/datastores';
import { QdrantSchema as Schema } from '@app/types/models';
import { postFetcher } from '@app/utils/swr-fetcher';

import { DatastoreFormProps } from './types';

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

  const upsertDatastoreMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createDatastore>
  >(`/api/datastores`, postFetcher<Schema>);

  const onSubmit = async (values: Schema) => {
    try {
      const datastore = await toast.promise(
        upsertDatastoreMutation.trigger(values as any),
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

    methods.handleSubmit(onSubmit)(e);
  };

  const networkError = upsertDatastoreMutation.error?.message;

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
              <Typography level="body3">
                When activated, your datastore will be available by anyone on
                the internet.{' '}
                <Typography fontWeight={'bold'} color="primary">
                  Required for a public ChatGPT plugin.
                </Typography>
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
            isLoading: upsertDatastoreMutation.isMutating,
          })
        ) : (
          <Button
            type="submit"
            variant="soft"
            size="md"
            loading={upsertDatastoreMutation.isMutating}
            {...props.submitButtonProps}
          >
            {props.submitButtonText || 'Submit'}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}
