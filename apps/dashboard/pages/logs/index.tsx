import { CloseRounded } from '@mui/icons-material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ArrowCircleRightRoundedIcon from '@mui/icons-material/ArrowCircleRightRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import Notifications from '@mui/icons-material/Notifications';
import {
  Button,
  ColorPaletteProp,
  IconButton,
  Input,
  Option,
  Select,
  SelectProps,
  TabList,
  Tabs,
} from '@mui/joy';
import Alert from '@mui/joy/Alert';
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
import Tab, { tabClasses } from '@mui/joy/Tab';
import Typography from '@mui/joy/Typography';
import { SxProps } from '@mui/material';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement, useEffect, useMemo } from 'react';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import ChatBox from '@app/components/ChatBox';
import { ConversationExport } from '@app/components/ConversationExport';
import CopyButton from '@app/components/CopyButton';
import ImproveAnswerModal from '@app/components/ImproveAnswerModal';
import Layout from '@app/components/Layout';
import { updateConversationStatus } from '@app/components/ResolveButton';
import { handleEvalAnswer } from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';

import relativeDate from '@chaindesk/lib/relative-date';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { EvalSchema } from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { ConversationStatus, MessageEval, Prisma } from '@chaindesk/prisma';

import { getAgents } from '../api/agents';
import { getLogs } from '../api/logs';
import { getConversation } from '../api/logs/[id]';

const LIMIT = 20;

interface SelectQueryParamFilterProps<T> {
  filterName: string;
}

function SelectQueryParamFilter<T extends {}>({
  filterName,
  ...otherProps
}: SelectQueryParamFilterProps<T> & SelectProps<T, false>) {
  const router = useRouter();
  const currentValue = router.query[filterName] as T;

  return (
    <Select
      value={currentValue}
      onChange={(_, value) => {
        if (value && typeof value === 'string') {
          router.query[filterName] = value;
          router.replace(router, undefined, {
            shallow: true,
          });
        }
      }}
      sx={(theme) => ({
        width: 175,
        height: 2,
        fontSize: 14,
        [theme.breakpoints.down('sm')]: {
          width: '100%',
        },
      })}
      {...(currentValue && {
        // display the button and remove select indicator
        // when user has selected a value
        endDecorator: (
          <IconButton
            size="sm"
            variant="plain"
            color="neutral"
            onMouseDown={(event) => {
              // don't open the popup when clicking on this button
              event.stopPropagation();
            }}
            onClick={() => {
              router.query[filterName] = '';
              router.replace(router, undefined, {
                shallow: true,
              });
            }}
          >
            <CloseRounded />
          </IconButton>
        ),
        indicator: null,
      })}
      {...otherProps}
    />
  );
}

enum TabEnum {
  all = 'all',
  unresolved = 'unresolved',
  unread = 'unread',
  human_requested = 'human_requested',
}

const tabToParams = (tab: string): Record<string, unknown> => {
  switch (tab) {
    case TabEnum.human_requested:
      return {
        status: ConversationStatus.HUMAN_REQUESTED,
        unread: '',
      };
    case TabEnum.unresolved:
      return {
        status: ConversationStatus.UNRESOLVED,
        unread: '',
      };

    case TabEnum.all:
      return {
        status: '',
        unread: '',
      };
    case TabEnum.unread:
      return {
        status: '',
        unread: true,
      };
    default:
      return {};
  }
};

export default function LogsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const conversationId = router.query.conversationId as string;

  const hasFilterApplied =
    router.query.eval ||
    router.query.agentId ||
    router.query.tab !== TabEnum.all;

  const parentRef = React.useRef();
  const [state, setState] = useStateReducer({
    currentConversationId: undefined as string | undefined,
    hasReachedEnd: false,
    currentImproveAnswerID: undefined as string | undefined,
    improveAnswerDefaultValue: '' as string | undefined,
    currentConversationIndex: 0,
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

    const params = new URLSearchParams({
      cursor: cursor || '',
      conversationId: conversationId || '',
      eval: (router.query.eval as string) || '',
      agentId: (router.query.agentId as string) || '',
      ...tabToParams(router.query.tab as string),
    });

    return `/api/logs?${params.toString()}`;
  }, fetcher);

  const getConversationQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversation>
  >(
    state.currentConversationId
      ? `/api/logs/${state.currentConversationId}`
      : null,
    fetcher
  );

  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  const handleChangeTab = (tab: TabEnum) => {
    router.query.tab = tab;
    router.replace(router);
  };

  // Fetch single converstaion from query parameter (e.g: load converstaion from email notification)
  const getSingleConversationQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversation>
  >(conversationId ? `/api/logs/${conversationId}` : null, fetcher);

  const handleBannerAction = async ({
    conversationId,
    conversationStatus,
  }: {
    conversationId: string;
    conversationStatus: ConversationStatus;
  }) => {
    await updateConversationStatus(conversationId, conversationStatus);

    // sync data
    await Promise.all([
      getConversationQuery.mutate(),
      getConversationsQuery.mutate(),
    ]);
  };

  const conversations = useMemo(() => {
    return [
      ...(getSingleConversationQuery?.data
        ? [getSingleConversationQuery?.data]
        : []),
      ...(getConversationsQuery?.data?.flat() || [])?.filter(
        // Filter out single conversation from list
        (each) => each.id !== getSingleConversationQuery?.data?.id
      ),
    ];
  }, [getConversationsQuery?.data, getSingleConversationQuery?.data]);

  useEffect(() => {
    setState({
      currentConversationId:
        conversations.length >= 0 &&
        state.currentConversationIndex >= conversations.length
          ? conversations?.[conversations?.length - 1]?.id
          : conversations?.[state.currentConversationIndex]?.id,
    });
  }, [conversations]);

  useEffect(() => {
    if (getSingleConversationQuery?.data?.id) {
      setState({
        currentConversationId: getSingleConversationQuery?.data?.id,
      });
    }
  }, [getSingleConversationQuery?.data?.id]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab(TabEnum.unresolved);
    }
    setState({ currentConversationIndex: 0 });
  }, [router.query.tab]);

  // useEffect(() => {

  // }, [state.currentConversationId]);

  if (!session?.organization) return null;

  if (
    !getConversationsQuery.isLoading &&
    conversations.length === 0 &&
    !hasFilterApplied
  ) {
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
            <Typography level="body-md">No Data</Typography>
            <Typography level="body-sm">
              All conversations with your agents will be visible here
            </Typography>
          </Stack>
        </Stack>
      </Alert>
    );
  }

  function BannerActions(props: {
    email?: string;
    status: ConversationStatus;
    currentConversationId: string;
  }) {
    const [isLoading, setIsLoading] = React.useState(false);

    return (
      <Stack direction="row" spacing={1}>
        {props.email && (
          <Input
            endDecorator={<CopyButton text={props.email} />}
            variant="outlined"
            value={props.email}
          ></Input>
        )}

        {props.email && props.status === ConversationStatus.HUMAN_REQUESTED && (
          <Button
            size="sm"
            color="neutral"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `mailto:${props.email}`;
            }}
          >
            Reply
          </Button>
        )}

        <Button
          size="sm"
          loading={isLoading}
          color={
            {
              [ConversationStatus.RESOLVED]: 'danger',
              [ConversationStatus.UNRESOLVED]: 'success',
              [ConversationStatus.HUMAN_REQUESTED]: 'success',
            }[props.status] as ColorPaletteProp
          }
          onClick={async () => {
            try {
              setIsLoading(true);
              await handleBannerAction({
                conversationId: props.currentConversationId!,
                conversationStatus: {
                  [ConversationStatus.RESOLVED]: ConversationStatus.UNRESOLVED,
                  [ConversationStatus.UNRESOLVED]: ConversationStatus.RESOLVED,
                  [ConversationStatus.HUMAN_REQUESTED]:
                    ConversationStatus.RESOLVED,
                }[props.status],
              });
            } catch {
            } finally {
              setIsLoading(false);
            }
          }}
          endDecorator={
            {
              [ConversationStatus.RESOLVED]: (
                <ArrowCircleRightRoundedIcon fontSize="sm" />
              ),
              [ConversationStatus.UNRESOLVED]: (
                <CheckCircleRoundedIcon fontSize="sm" />
              ),
              [ConversationStatus.HUMAN_REQUESTED]: (
                <CheckCircleRoundedIcon fontSize="sm" />
              ),
            }[props.status]
          }
        >
          {
            {
              [ConversationStatus.RESOLVED]: 'Unresolve',
              [ConversationStatus.UNRESOLVED]: 'Resolve',
              [ConversationStatus.HUMAN_REQUESTED]: 'Resolve',
            }[props.status]
          }
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={1} sx={{ height: 'calc(100vh - 175px)' }}>
      {/* <Alert
        variant="soft"
        color="neutral"
        startDecorator={<InfoRoundedIcon />}
      >
        View all Agents conversations across all channels. Evaluate and improve
        answers.
      </Alert> */}
      <Tabs
        aria-label="tabs"
        value={(router.query.tab as string) || TabEnum.all}
        size="lg"
        sx={{ bgcolor: 'transparent' }}
        defaultValue={1}
        onChange={(event, value) => {
          handleChangeTab(value as any);
        }}
      >
        <TabList
          size="sm"
          color="neutral"
          sx={{
            ml: 0,
            [`&& .${tabClasses.root}`]: {
              flex: 'initial',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'transparent',
              },
              [`&.${tabClasses.selected}`]: {
                color: 'primary.plainColor',
                '&::after': {
                  bgcolor: 'primary.500',
                },
              },
            },
          }}
        >
          <Tab indicatorInset value={TabEnum.unresolved}>
            Unresolved
          </Tab>

          <Tab indicatorInset value={TabEnum.unread}>
            Unread
          </Tab>

          <Tab indicatorInset value={TabEnum.human_requested}>
            Human Requested
          </Tab>

          <Tab indicatorInset value={TabEnum.all}>
            All
          </Tab>
        </TabList>
      </Tabs>
      {/* <Divider  /> */}
      <Stack
        width="100%"
        pl={1}
        gap={1}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          '@media (max-width: 750px)': {
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row', // Default direction
            gap: 1,
            '@media (max-width: 750px)': {
              flexDirection: 'column', // Change direction for screens <= 600px
              height: 'auto',
            },
          }}
        >
          <SelectQueryParamFilter<EvalSchema>
            filterName="eval"
            placeholder="Filter by Evaluation"
          >
            <Option
              key={MessageEval.good}
              value={MessageEval.good}
              sx={{ fontSize: 14 }}
            >
              🟢 Good
            </Option>
            <Option
              key={MessageEval.bad}
              value={MessageEval.bad}
              sx={{ fontSize: 14 }}
            >
              🔴 Bad
            </Option>
          </SelectQueryParamFilter>

          <SelectQueryParamFilter<string>
            filterName="agentId"
            placeholder="Filter by Agent"
          >
            {getAgentsQuery.data?.map((each) => (
              <Option key={each.id} value={each.id}>
                {`🤖 ${each.name}`}
              </Option>
            ))}
          </SelectQueryParamFilter>
        </Stack>
        <Stack>
          <ConversationExport />
        </Stack>
      </Stack>

      <Sheet
        variant="outlined"
        sx={(theme) => ({
          height: '100%',
          borderRadius: 'sm',
          ml: 1,
        })}
      >
        <Stack direction={'row'} sx={{ height: '100%' }}>
          <Stack
            direction={'column'}
            sx={(theme) => ({
              [theme.breakpoints.down('sm')]: {
                width: '100px',
              },
              [theme.breakpoints.up('sm')]: {
                width: '300px',
              },
            })}
          >
            <List
              // sx={{ '--ListItemDecorator-size': '56px' }}
              ref={parentRef as any}
              sx={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                '--ListDivider-gap': '0px',
                borderRadius: 0,
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
                style={{ height: '100%' }}
              >
                {/* Add fragment to remove InfiniteScroll warning when empty conversations */}
                <React.Fragment />
                {conversations.length === 0 && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      height: '100%',
                      my: '50%',
                    }}
                  >
                    No Conversations found
                  </Box>
                )}
                {conversations.map((each, index) => (
                  <React.Fragment key={each.id}>
                    <ListItem
                      sx={(theme) => ({
                        py: 1,
                        '&:hover': {
                          cursor: 'pointer',
                          backgroundColor: theme.palette.action.hover,
                          borderRadius: 0,
                        },

                        // backgroundColor: {
                        //   [ConversationStatus.RESOLVED]:
                        //     theme.palette.success.softActiveBg,
                        //   [ConversationStatus.UNRESOLVED]:
                        //     theme.palette.danger.softActiveBg,
                        //   [ConversationStatus.HUMAN_REQUESTED]:
                        //     theme.palette.warning.softActiveBg,
                        // }[each?.status] as ColorPaletteProp,

                        ...(state.currentConversationId === each.id && {
                          backgroundColor: theme.palette.action.hover,
                        }),
                      })}
                      onClick={() => {
                        setState({
                          currentConversationId: each.id,
                          currentConversationIndex: index,
                        });
                      }}
                      endAction={
                        each?._count?.messages > 0 ? (
                          <Chip variant="solid" color="danger" size="md">
                            {each?._count?.messages}
                          </Chip>
                        ) : (
                          <>
                            {each?.status === ConversationStatus.RESOLVED && (
                              <CheckCircleRoundedIcon
                                color="success"
                                fontSize="xl2"
                              />
                            )}
                            {each?.status ===
                              ConversationStatus.HUMAN_REQUESTED && (
                              <AccountCircleRoundedIcon
                                color="warning"
                                fontSize="xl2"
                              />
                            )}
                            {each?.status === ConversationStatus.UNRESOLVED && (
                              <ArrowCircleRightRoundedIcon
                                color="danger"
                                fontSize="xl2"
                              />
                            )}
                          </>
                        )
                      }
                    >
                      <ListItemContent>
                        <Stack>
                          <Stack
                            direction="row"
                            justifyContent={'space-between'}
                          >
                            <Typography>{each?.agent?.name}</Typography>

                            <Typography level="body-xs">
                              {relativeDate(each?.updatedAt)}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            justifyContent={'space-between'}
                            alignItems={'start'}
                            gap={1}
                          >
                            <Typography level="body-sm" noWrap>
                              {each?.messages?.[0]?.text}
                            </Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            sx={{
                              mt: 1,
                            }}
                            gap={1}
                          >
                            <Chip size="sm" color="neutral" variant="outlined">
                              {'🤖 '}
                              {each?.agent?.name}
                            </Chip>
                            <Chip size="sm" color="neutral" variant="outlined">
                              {'🚀 '}
                              {each?.channel}
                            </Chip>
                          </Stack>
                        </Stack>
                      </ListItemContent>
                    </ListItem>
                    <ListDivider />
                  </React.Fragment>
                ))}
              </InfiniteScroll>

              {getConversationsQuery.isLoading && (
                <CircularProgress
                  size="sm"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    zIndex: 99,
                  }}
                />
              )}
            </List>
          </Stack>

          <Divider orientation="vertical" />
          <Box
            sx={{ width: '100%', height: '100%', overflow: 'hidden', pb: 4 }}
          >
            {getConversationQuery.data && (
              <>
                <Alert
                  // color="neutral"
                  color="neutral"
                  variant="soft"
                  slotProps={{
                    root: {
                      sx: {
                        borderRadius: 0,

                        borderTopWidth: '6px',
                        borderTopStyle: 'solid',
                        borderTopColor: {
                          [ConversationStatus.RESOLVED]: 'success.solidBg',
                          [ConversationStatus.UNRESOLVED]: 'danger.solidBg',
                          [ConversationStatus.HUMAN_REQUESTED]:
                            'warning.solidBg',
                        }[getConversationQuery?.data?.status],
                      },
                    },
                  }}
                  startDecorator={<Notifications />}
                  endDecorator={
                    <BannerActions
                      status={getConversationQuery?.data?.status}
                      email={getConversationQuery?.data?.lead?.email!}
                      currentConversationId={state.currentConversationId!}
                    />
                  }
                >
                  <p>
                    {
                      {
                        [ConversationStatus.RESOLVED]:
                          'This conversation hass been resolved.',
                        [ConversationStatus.UNRESOLVED]:
                          'This conversation is still unresolved.',
                        [ConversationStatus.HUMAN_REQUESTED]:
                          'Human assistance has been requested.',
                      }[getConversationQuery?.data?.status]
                    }
                  </p>
                </Alert>
              </>
            )}

            <ChatBox
              messages={
                getConversationQuery?.data?.messages?.map((each) => ({
                  id: each.id,
                  from: each.from,
                  message: each.text,
                  createdAt: each.createdAt,
                  eval: each.eval,
                })) || []
              }
              isLoadingConversation={getConversationQuery?.isLoading}
              onSubmit={async () => {}}
              readOnly={true}
              handleEvalAnswer={handleEvalAnswer}
              handleImprove={(message, index) => {
                const prev = getConversationQuery?.data?.messages?.[index - 1];

                setState({
                  currentImproveAnswerID: message?.id,
                  improveAnswerDefaultValue: prev?.text,
                });
              }}
              userImgUrl={session?.user?.image!}
            />
          </Box>
        </Stack>

        {state.currentImproveAnswerID && (
          <ImproveAnswerModal
            isOpen={!!state.currentImproveAnswerID}
            handleCloseModal={() => {
              setState({
                currentImproveAnswerID: '',
              });
            }}
            messageId={state.currentImproveAnswerID}
            question={state.improveAnswerDefaultValue}
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
