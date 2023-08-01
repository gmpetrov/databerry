import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Conversation, Prisma } from '@prisma/client';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import useSWR, { useSWRConfig } from 'swr';
import useSWRInfinite from 'swr/infinite';

import useStateReducer from '@app/hooks/useStateReducer';
import { getConversations } from '@app/pages/api/agents/[id]/c';
import { fetcher } from '@app/utils/swr-fetcher';

type Props = {
  agentId: string;
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
          ...(props.selected
            ? {
                backgroundColor: theme.palette.background.level2,
              }
            : {}),
        })}
      >
        <ListItemButton
          selected={!!props.selected}
          onClick={() => props.handleClick?.(props.id)}
        >
          <Typography className="truncate" level="body2">
            {props.text}
          </Typography>
        </ListItemButton>
      </ListItem>

      <ListDivider />
    </React.Fragment>
  );
};

function ConversationList({ agentId }: Props) {
  const scrollParentRef = useRef(null);
  const router = useRouter();
  const conversationId = router.query.conversationId as string;
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

      return `/api/agents/${agentId}/c?cursor=${cursor || ''} `;
    },
    fetcher,
    {
      refreshInterval: 5000,
      onSuccess: (data) => {
        const id = data?.[0]?.[0]?.id;

        if (!state.hasLoadedOnce && !conversationId && id) {
          // Focus on first conversation after first load if none set
          setState({ hasLoadedOnce: true });
          router.query.conversationId = id;
          router.replace(router, undefined, { shallow: true });
        }
      },
    }
  );

  const conversations = getConversationsQuery?.data?.flat?.() || [];

  const handleClick = (id: string) => {
    router.query.conversationId = id;
    router.replace(router, undefined, { shallow: true });
  };

  return (
    <Stack sx={{ height: '100%' }} gap={1}>
      <Button
        size="sm"
        variant="plain"
        onClick={() => {
          router.query.conversationId = undefined;
          router.replace(router, undefined, { shallow: true });
        }}
        startDecorator={<AddRoundedIcon />}
      >
        New Chat
      </Button>
      <List
        slotProps={{
          root: {
            ref: scrollParentRef,
          },
        }}
        sx={(theme) => ({
          height: '100%',
          maxHeight: '100%',
          borderRadius: 'sm',
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

                  <ListDivider></ListDivider>
                </React.Fragment>
              )) as any
          }
        >
          {conversations?.map((each) => (
            <Item
              key={each.id}
              id={each.id}
              text={each?.messages?.[0]?.text}
              selected={each.id === conversationId}
              handleClick={handleClick}
            />
          ))}
        </InfiniteScroll>
      </List>
    </Stack>
  );
}

export default ConversationList;
