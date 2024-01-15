import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import { SxProps } from '@mui/joy/styles/types';
import Typography from '@mui/joy/Typography';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import useSWR, { useSWRConfig } from 'swr';
import useSWRInfinite from 'swr/infinite';

import useStateReducer from '@app/hooks/useStateReducer';
import { getConversations } from '@app/pages/api/conversations';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { Prisma } from '@chaindesk/prisma';

type Props = {
  agentId?: string;
  rootSx?: SxProps;
  currentConversationId?: string;
  handleSelectConversation?(conversationId: string): void;
  handleCreateNewChat?(): void;
};

const Item = (props: {
  id: string;
  text: string;
  selected?: boolean;
  handleClick?: (id: string) => any;
}) => {
  return (
    <React.Fragment>
      <ListItem
        sx={(theme) => ({
          mx: 1,
          my: 0.5,
          borderRadius: 'sm',
          overflow: 'hidden',
          ...(props.selected
            ? {
                backgroundColor: theme.palette.background.level2,
              }
            : {}),
        })}
      >
        <ListItemButton
          selected={!!props.selected}
          onClick={(e) => {
            e.stopPropagation();
            props.handleClick?.(props.id);
          }}
        >
          <Typography className="truncate" level="body-sm">
            {props.text}
          </Typography>
        </ListItemButton>
      </ListItem>

      {/* <ListDivider /> */}
    </React.Fragment>
  );
};

function ConversationList({
  agentId,
  rootSx,
  handleSelectConversation,
  currentConversationId,
  handleCreateNewChat,
}: Props) {
  const scrollParentRef = useRef(null);
  const router = useRouter();
  const [state, setState] = useStateReducer({
    hasMore: true,
    hasLoadedOnce: false,
  });

  const getConversationsQuery = useSWRInfinite<
    Prisma.PromiseReturnType<typeof getConversations>
  >(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && previousPageData?.length === 0) {
        setState({
          hasMore: false,
        });
        return null;
      }

      const cursor = previousPageData?.[previousPageData?.length - 1]
        ?.id as string;

      return `/api/conversations?cursor=${cursor || ''}${
        agentId ? `&agentId=${agentId}` : ''
      }`;
    },
    fetcher,
    {
      refreshInterval: 5000,
      onSuccess: (data) => {
        const id = data?.[0]?.[0]?.id;

        if (!state.hasLoadedOnce && !currentConversationId && id) {
          setState({ hasLoadedOnce: true });
        }
      },
    }
  );

  const conversations = getConversationsQuery?.data?.flat?.() || [];

  useEffect(() => {
    if (router.query?.conversationId) {
      handleSelectConversation?.(router.query.conversationId as string);
    } else {
      handleSelectConversation?.(conversations[0]?.id);
    }
  }, [getConversationsQuery?.data]);

  if (!getConversationsQuery.isLoading && conversations.length === 0) {
    return null;
  }

  return (
    <Stack
      sx={(theme) => ({
        height: '100%',
        borderRight: 1,
        borderColor: theme.palette.divider,
        ...(rootSx as any),
      })}
      // gap={1}
    >
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={handleCreateNewChat}
        startDecorator={<AddRoundedIcon fontSize="sm" />}
        sx={{ m: 1, whiteSpace: 'nowrap' }}
      >
        New Chat
      </Button>
      {/* <Divider /> */}
      <List
        slotProps={{
          root: {
            ref: scrollParentRef,
          },
        }}
        sx={(theme) => ({
          height: '100%',
          maxHeight: '100%',
          border: 'none',
          overflow: 'auto',
          '--ListDivider-gap': '0px',
        })}
        size="sm"
        variant="outlined"
      >
        <InfiniteScroll
          useWindow={false}
          getScrollParent={() => scrollParentRef.current}
          loadMore={() => {
            if (
              getConversationsQuery.isLoading ||
              getConversationsQuery.isValidating
            )
              return;

            getConversationsQuery.setSize(getConversationsQuery.size + 1);
          }}
          hasMore={state.hasMore}
          loader={
            Array(3)
              .fill(0)
              .map((each, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <Skeleton variant="text" />
                  </ListItem>

                  {/* <ListDivider />   */}
                </React.Fragment>
              )) as any
          }
        >
          {conversations?.map((each) => (
            <Item
              key={each.id}
              id={each.id}
              text={each?.messages?.[0]?.text}
              selected={each.id === currentConversationId}
              handleClick={handleSelectConversation}
            />
          ))}
        </InfiniteScroll>
      </List>
    </Stack>
  );
}

export default ConversationList;
