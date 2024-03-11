import { Box, Chip, Option, Select, Stack, Typography } from '@mui/joy';
import Autocomplete from '@mui/joy/Autocomplete';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useSWR from 'swr';

import { getServiceProviders } from '@app/pages/api/service-providers';

import { getCollections } from '@chaindesk/integrations/shopify/api/collections/get';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import {
  DatasourceSchema,
  DatasourceShopify,
} from '@chaindesk/lib/types/models';
import { DatasourceType } from '@chaindesk/prisma';

import ConnectShopifyStore from '../ConnectShopifyStore';
import Loader from '../Loader';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps<DatasourceShopify> & {};

function Nested() {
  const { data: session } = useSession();
  const getProvidersQuery = useSWR<
    Awaited<ReturnType<typeof getServiceProviders>>
  >(
    session?.organization.id ? `/api/service-providers?type=shopify` : null,
    fetcher
  );

  const { register, setValue, watch } = useFormContext<DatasourceShopify>();

  const shop = watch('config.shop');

  const getCollectionsQuery = useSWR<
    Awaited<ReturnType<typeof getCollections>>
  >(
    session?.organization.id && shop
      ? `/api/integrations/shopify/collections?shop=${shop}`
      : null,
    fetcher
  );

  return (
    <Stack>
      <Typography level="body-md">Choose a shopify store</Typography>
      <Select
        {...register('config.shop')}
        onChange={(_, value) => {
          setValue('config.shop', value as string, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      >
        {getProvidersQuery?.data?.map((provider) => (
          <Option key={provider.id} value={provider.externalId}>
            {(provider.config as any)?.shopify_offline_session?.shop}
          </Option>
        ))}
      </Select>

      {getCollectionsQuery.isLoading && (
        <Stack my={2} sx={{ textAlign: 'center' }} spacing={1}>
          <Loader />
          <Typography level="body-sm">Loading Collections...</Typography>
        </Stack>
      )}

      {(getCollectionsQuery.data || []).length > 0 && (
        <>
          <Typography sx={{ mt: 2 }} level="body-md">
            Select The Collections you want To Use
          </Typography>
          <Autocomplete
            multiple
            disabled={getCollectionsQuery.isValidating}
            placeholder="Collections"
            getOptionLabel={(option) => option.title}
            options={getCollectionsQuery?.data || []}
            onChange={(_, value) => {
              setValue(
                'config.collections',
                value.map((collection) => ({
                  id: collection.id,
                  name: collection.title,
                })),
                {
                  shouldDirty: true,
                  shouldValidate: true,
                }
              );
            }}
          />
        </>
      )}
    </Stack>
  );
}

export default function ShopifyForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <>
      <ConnectShopifyStore />
      <Base
        schema={DatasourceSchema}
        {...rest}
        hideName
        defaultValues={{
          ...props.defaultValues!,
          type: DatasourceType.shopify,
        }}
      >
        <Nested />
      </Base>
    </>
  );
}
