import Button from '@mui/joy/Button';
import FormControl, { FormControlProps } from '@mui/joy/FormControl';
import FormLabel, { FormLabelProps } from '@mui/joy/FormLabel';
import Option from '@mui/joy/Option';
import Select, { SelectProps } from '@mui/joy/Select';
import { ServiceProviderType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React from 'react';
import useSWR from 'swr';

import { getServiceProviders } from '@app/pages/api/service-providers';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { ServiceProvider } from '@chaindesk/prisma';

import Loader from './Loader';
type Props = SelectProps<string, false> & {
  label?: string;
  type?: ServiceProviderType;
  agentId?: string;
  formControlProps?: FormControlProps;
  formLabelProps?: FormLabelProps;
  getOptionLabel?: (provider: ServiceProvider) => string;
  withDelete?: boolean;
};

function SelectServiceProvider({
  label,
  type,
  agentId,
  formControlProps,
  formLabelProps,
  getOptionLabel,
  withDelete,
  ...otherProps
}: Props) {
  const getProvidersQuery = useSWR<
    Awaited<ReturnType<typeof getServiceProviders>>
  >(() => {
    const params = new URLSearchParams({
      ...(type
        ? {
            type: `${type}`,
          }
        : {}),
      ...(agentId
        ? {
            agentId: `${agentId}`,
          }
        : {}),
    });

    return `/api/service-providers?${params.toString()}`;
  }, fetcher);

  if (!getProvidersQuery.data && getProvidersQuery.isLoading) {
    return <Loader />;
  }

  return (
    <FormControl {...formControlProps}>
      <FormLabel {...formLabelProps}>{label || 'Select Provider'}</FormLabel>
      <Select {...otherProps}>
        {getProvidersQuery?.data?.map((provider) => (
          <Option key={provider.id} value={provider.id}>
            {getOptionLabel
              ? getOptionLabel?.(provider)
              : provider.name || provider.id}

            <Button
              color="danger"
              onClick={(e) => {
                console.log('DELETE _-------->');
              }}
            >
              delete
            </Button>
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}

export default SelectServiceProvider;
