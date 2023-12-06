import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Option from '@mui/joy/Option';
import Select, { SelectProps } from '@mui/joy/Select';
import { ServiceProviderType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React from 'react';
import useSWR from 'swr';

import { getServiceProviders } from '@app/pages/api/service-providers';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
type Props = SelectProps<string, false> & {
  label?: string;
  serviceProviderType?: ServiceProviderType;
};

function SelectServiceProvider({
  label,
  serviceProviderType,
  ...otherProps
}: Props) {
  const { data: session } = useSession();

  const getProvidersQuery = useSWR<
    Awaited<ReturnType<typeof getServiceProviders>>
  >(
    session?.organization.id
      ? `/api/service-providers?${
          serviceProviderType ? `type=${serviceProviderType}` : ''
        }`
      : null,
    fetcher
  );

  return (
    <FormControl>
      <FormLabel>{label || 'Select Account'}</FormLabel>
      <Select {...otherProps}>
        {getProvidersQuery?.data?.map((provider) => (
          <Option key={provider.id} value={provider.id}>
            {provider.name || provider.id}
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}

export default SelectServiceProvider;
