import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Button, CircularProgress, ListItemDecorator } from '@mui/joy';
import IconButton from '@mui/joy/IconButton';
import List, { ListProps } from '@mui/joy/List';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import { ServiceProviderType } from '@prisma/client';
import axios from 'axios';
import React, { useCallback } from 'react';

import useServiceProviders from '@app/hooks/useServiceProviders';
import useStateReducer from '@app/hooks/useStateReducer';

import { ServiceProvider } from '@chaindesk/prisma';

import Empty from './Empty';
import Loader from './Loader';
type Props = ListProps & {
  label?: string;
  type?: ServiceProviderType;
  agentId?: string;
  getListItemLabel?: (provider: ServiceProvider) => string;
  withDelete?: boolean;
  emptyLabel?: string | JSX.Element;
  listItemDecorator?: JSX.Element;
  renderItemActions?: (item: ServiceProvider) => JSX.Element;
};

function ListServiceProviders({
  label,
  type,
  agentId,
  getListItemLabel,
  withDelete,
  emptyLabel = 'No Connections',
  listItemDecorator,
  renderItemActions,
  ...otherProps
}: Props) {
  const [state, setState] = useStateReducer({
    isUpdateLoading: false,
    isDeleteLoading: false,
  });

  const { query } = useServiceProviders({
    type,
    agentId,
  });

  const handleDelete = useCallback(
    (id: string) => async () => {
      try {
        if (
          !window.confirm('Are you sure you want to delete this connection?')
        ) {
          return;
        }

        setState({ isDeleteLoading: true });
        await axios.delete(`/api/service-providers/${id}`);
        query.mutate();
      } catch (err) {
        console.log(err);
      } finally {
        setState({ isDeleteLoading: false });
      }
    },
    [setState]
  );

  if (!query.data && query.isLoading) {
    return <Loader />;
  }

  if (query?.data?.length === 0 && !query.isLoading) {
    return <Empty label={emptyLabel} />;
  }

  return (
    <List {...otherProps}>
      {query?.data?.map((provider, index) => (
        <React.Fragment key={provider.id}>
          <ListItem>
            {listItemDecorator && (
              <ListItemDecorator>{listItemDecorator}</ListItemDecorator>
            )}
            <ListItemContent>
              {getListItemLabel
                ? getListItemLabel?.(provider)
                : provider.name || provider.id}
            </ListItemContent>

            {renderItemActions ? renderItemActions(provider) : null}

            {withDelete && (
              <IconButton
                variant="soft"
                color="danger"
                size="sm"
                onClick={handleDelete(provider.id)}
                disabled={state.isDeleteLoading}
              >
                {state.isDeleteLoading ? (
                  <CircularProgress size="sm" />
                ) : (
                  <DeleteRoundedIcon />
                )}
              </IconButton>
            )}
          </ListItem>

          {/* {index < (query?.data?.length || 0) - 1 && <ListDivider />} */}
        </React.Fragment>
      ))}
    </List>
  );
}

export default ListServiceProviders;
