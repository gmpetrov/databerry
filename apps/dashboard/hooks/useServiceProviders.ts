import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import List, { ListProps } from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import { ServiceProviderType } from '@prisma/client';
import axios from 'axios';
import React, { useCallback } from 'react';
import useSWR from 'swr';

import { getServiceProviders } from '@app/pages/api/service-providers';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { ServiceProvider } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

type Props = {
  type?: ServiceProviderType;
  agentId?: string;
};
const useServiceProviders = ({ type, agentId }: Props) => {
  const query = useSWR<Awaited<ReturnType<typeof getServiceProviders>>>(() => {
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

  return {
    query,
  };
};

export default useServiceProviders;
