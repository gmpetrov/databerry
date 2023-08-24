import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import Alert from '@mui/joy/Alert';
import Avatar from '@mui/joy/Avatar';
import Badge from '@mui/joy/Badge';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import Sheet from '@mui/joy/Sheet';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Prisma } from '@prisma/client';
import { GetServerSidePropsContext } from 'next/types';
import { getServerSession } from 'next-auth/next';
import { ReactElement, useCallback } from 'react';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import ChatBox from '@app/components/ChatBox';
import ImproveAnswerModal from '@app/components/ImproveAnswerModal';
import Layout from '@app/components/Layout';
import { handleEvalAnswer } from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';
import { authOptions } from '@app/pages/api/auth/[...nextauth]';
import relativeDate from '@app/utils/relative-date';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

import { getLogs } from '../api/logs';
import { getMessages } from '../api/logs/[id]';

const LIMIT = 20;

export default function LogsPage() {
  const parentRef = React.useRef();
  const [state, setState] = useStateReducer({
    currentConversationId: undefined as string | undefined,
    hasReachedEnd: false,
    currentImproveAnswerID: undefined as string | undefined,
  });
  const getConversationsQuery = useSWRInfinite<
    Prisma.PromiseReturnType<typeof getLogs>
  >((pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) {
      setState({
        hasReachedEnd: true,
      });
      return null; // reached the end
    }

    const cursor = previousPageData?.[previousPageData?.length - 1]
      ?.id as string;

    return `/api/logs?cursor=${cursor || ''}`;
  }, fetcher);

  const getMessagesQuery = useSWR<Prisma.PromiseReturnType<typeof getMessages>>(
    state.currentConversationId
      ? `/api/logs/${state.currentConversationId}`
      : null,
    fetcher
  );

  const conversations = getConversationsQuery?.data?.flat() || [];

  if (!getConversationsQuery.isLoading && conversations.length === 0) {
    return (
      <Alert
        variant="outlined"
        sx={{
          textAlign: 'center',
          justifyContent: 'center',
          maxWidth: 'sm',
          mx: 'auto',
        }}
      >
        <Stack justifyContent={'center'} alignItems={'center'} gap={1}>
          <Typography level="h4" color="primary">
            <InboxRoundedIcon />
          </Typography>
          <Stack>
            <Typography level="body1">No Data</Typography>
            <Typography level="body2">
              All conversations with your agents will be visible here
            </Typography>
          </Stack>
        </Stack>
      </Alert>
    );
  }

  return (
    <Stack gap={2} sx={{ height: 'calc(100vh - 160px)' }}>
      <Alert
        variant="soft"
        color="neutral"
        startDecorator={<InfoRoundedIcon />}
      >
        View all Agents conversations across all channels. Evaluate and improve
        answers.
      </Alert>

      <Sheet
        variant="outlined"
        sx={(theme) => ({
          height: '100%',
          borderRadius: 'sm',
        })}
      >
        <Stack direction={'row'} sx={{ height: '100%' }}>
          <List
            // aria-labelledby="ellipsis-list-demo"
            // sx={{ '--ListItemDecorator-size': '56px' }}
            ref={parentRef as any}
            sx={{
              width: 'sm',
              minWidth: 300,
              maxWidth: '30%',
              height: '100%',
              overflowY: 'auto',
              '--ListDivider-gap': '0px',
            }}
            size="sm"
          >
            <InfiniteScroll
              useWindow={false}
              getScrollParent={() => parentRef.current as any}
              loadMore={() => {
                if (
                  getConversationsQuery.isLoading ||
                  getConversationsQuery.isValidating
                )
                  return;

                getConversationsQuery.setSize(getConversationsQuery.size + 1);
              }}
              hasMore={!state.hasReachedEnd}
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
              {/* Add fragment to remove InfiniteScroll warning when empty conversations */}
              <React.Fragment />

              {conversations.map((each) => (
                <React.Fragment key={each.id}>
                  <ListItem
                    sx={(theme) => ({
                      py: 1,
                      '&:hover': {
                        cursor: 'pointer',
                        backgroundColor: theme.palette.action.hover,
                      },
                      ...(state.currentConversationId === each.id && {
                        backgroundColor: theme.palette.action.hover,
                      }),
                    })}
                    onClick={() => {
                      setState({
                        currentConversationId: each.id,
                      });
                    }}
                  >
                    <ListItemContent>
                      <Stack>
                        <Stack direction="row" justifyContent={'space-between'}>
                          <Typography>{each?.agent?.name}</Typography>

                          <Typography level="body3">
                            {relativeDate(each?.updatedAt)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent={'space-between'}
                          alignItems={'start'}
                          gap={1}
                        >
                          <Typography level="body2" noWrap>
                            {each?.messages?.[0]?.text}
                          </Typography>

                          {each?._count?.messages > 0 && (
                            <Chip
                              // variant="soft"
                              color="danger"
                              size="sm"
                            >
                              <Typography textColor={'common.white'}>
                                {each?._count?.messages}
                              </Typography>
                            </Chip>
                          )}
                        </Stack>
                        <Chip
                          size="sm"
                          color="neutral"
                          variant="outlined"
                          sx={{
                            mr: 'auto',
                            mt: 1,
                          }}
                        >
                          {each?.channel}
                        </Chip>
                      </Stack>
                    </ListItemContent>
                  </ListItem>
                  <ListDivider />
                </React.Fragment>
              ))}
            </InfiniteScroll>

            {getConversationsQuery.isLoading && (
              <CircularProgress size="sm" sx={{ mx: 'auto', my: 2 }} />
            )}
          </List>
          <Divider orientation="vertical" />
          <Box sx={{ width: '100%', paddingX: 2 }}>
            <ChatBox
              messages={
                getMessagesQuery?.data?.map((each) => ({
                  id: each.id,
                  from: each.from,
                  message: each.text,
                  createdAt: each.createdAt,
                  eval: each.eval,
                })) || []
              }
              onSubmit={async () => {}}
              readOnly={true}
              handleEvalAnswer={handleEvalAnswer}
              handleImprove={(message) => {
                setState({
                  currentImproveAnswerID: message?.id,
                });
              }}
            />
          </Box>
        </Stack>

        {state.currentImproveAnswerID && (
          <ImproveAnswerModal
            handleCloseModal={() => {
              setState({
                currentImproveAnswerID: '',
              });
            }}
            messageId={state.currentImproveAnswerID}
          />
        )}
      </Sheet>
    </Stack>
  );
}

LogsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
