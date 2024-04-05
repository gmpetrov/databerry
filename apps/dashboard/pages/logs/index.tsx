import { CloseRounded } from '@mui/icons-material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ArrowCircleRightRoundedIcon from '@mui/icons-material/ArrowCircleRightRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Notifications from '@mui/icons-material/Notifications';
import QuickreplyIcon from '@mui/icons-material/Quickreply';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import {
  Button,
  ColorPaletteProp,
  Dropdown,
  IconButton,
  Input,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
  SelectProps,
  TabList,
  Tabs as JoyTabs,
  Tooltip,
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
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ReactElement, useCallback, useEffect, useMemo } from 'react';
import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import toast from 'react-hot-toast';
import InfiniteScroll from 'react-infinite-scroller';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import ChatBox from '@app/components/ChatBox';
import { ConversationExport } from '@app/components/ConversationExport';
import CopyButton from '@app/components/CopyButton';
import DraftReplyInput from '@app/components/DarftReplyInput';
import ImproveAnswerModal from '@app/components/ImproveAnswerModal';
import InboxConversationSettings from '@app/components/InboxConversationSettings';
import Layout from '@app/components/Layout';
import { updateConversationStatus } from '@app/components/ResolveButton';
import { handleEvalAnswer } from '@app/hooks/useChat';
import useFileUpload from '@app/hooks/useFileUpload';
import useStateReducer from '@app/hooks/useStateReducer';

// import { client as crispClient } from '@chaindesk/lib/crisp';
import relativeDate from '@chaindesk/lib/relative-date';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { AIStatus } from '@chaindesk/lib/types/crisp';
import {
  EvalSchema,
  UpdateStatusAllConversationsSchema,
} from '@chaindesk/lib/types/dtos';
import {
  Attachment,
  ConversationChannel,
  ConversationPriority,
  ConversationStatus,
  MessageEval,
  MessageFrom,
  Prisma,
} from '@chaindesk/prisma';

import { getAgents } from '../api/agents';
import { updateStatus } from '../api/conversations/update-status';
import { getLogs } from '../api/logs';
import { getConversation } from '../api/logs/[id]';
import { getMemberships } from '../api/memberships';
import { markAllRead } from '../api/messages/mark-all-read';

const LIMIT = 20;

interface SelectQueryParamFilterProps {
  filterName: string;
}

function SelectQueryParamFilter<T extends {}>({
  filterName,
  ...otherProps
}: SelectQueryParamFilterProps & SelectProps<T, false>) {
  const router = useRouter();
  const currentValue = router.query[filterName] as unknown as T;

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

enum Tabs {
  all = 'all',
  unresolved = 'unresolved',
  unread = 'unread',
  human_requested = 'human_requested',
}

const tabToParams = (tab: string): Record<string, unknown> => {
  switch (tab) {
    case Tabs.human_requested:
      return {
        status: ConversationStatus.HUMAN_REQUESTED,
        unread: '',
      };
    case Tabs.unresolved:
      return {
        status: ConversationStatus.UNRESOLVED,
        unread: '',
      };

    case Tabs.all:
      return {
        status: '',
        unread: '',
      };
    case Tabs.unread:
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

  const targetConversationId = router.query.targetConversationId as string;

  const hasFilterApplied =
    router.query.eval ||
    router.query.agentId ||
    router.query.tab !== Tabs.all ||
    router.query.channel ||
    router.query.priority ||
    router.query.assigneeId;

  const parentRef = React.useRef();
  const [state, setState] = useStateReducer({
    currentConversationId: undefined as string | undefined,
    hasReachedEnd: false,
    currentImproveAnswerID: undefined as string | undefined,
    improveAnswerDefaultValue: '' as string | undefined,
    currentConversationIndex: 0,
    isAiEnabled: true,
    refreshInterval: 5000,
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
      conversationId: targetConversationId || '',
      eval: (router.query.eval as string) || '',
      agentId: (router.query.agentId as string) || '',
      channel: (router.query.channel as string) || '',
      priority: (router.query.priority as string) || '',
      assigneeId: (router.query.assigneeId as string) || '',
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
    fetcher,
    {
      // TODO: remove when we have websockets.
      // refreshInterval: state.refreshInterval,
    }
  );

  const getMembershipsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getMemberships>
  >(`/api/memberships`, fetcher);

  const currentMembership = getMembershipsQuery?.data?.find(
    (one) => one.userId === session?.user?.id
  );

  const conversationChatMutation = useSWRMutation(
    state.currentConversationId
      ? `/api/conversations/${state.currentConversationId}/message`
      : null,
    generateActionFetcher(HTTP_METHOD.POST)
  );

  const { upload } = useFileUpload();

  const updateStatusAllMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateStatus>,
    any,
    any,
    UpdateStatusAllConversationsSchema
  >(() => {
    return `/api/conversations/update-status${
      typeof window !== undefined ? window.location.search : ''
    }`;
  }, generateActionFetcher(HTTP_METHOD.POST));

  const markAllReadMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof markAllRead>
  >(() => {
    return `/api/messages/mark-all-read${
      typeof window !== undefined ? window.location.search : ''
    }`;
  }, generateActionFetcher(HTTP_METHOD.POST));

  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  const handleOperatorChat = async (message: string, files?: File[]) => {
    let attachments: Partial<Attachment>[] = [];

    if (files && files?.length > 0) {
      const filesUrls = await upload(
        files.map((each) => ({
          conversationId: state.currentConversationId,
          case: 'chatUpload',
          fileName: each.name,
          mimeType: each.type,
          file: each,
        }))
      );
      attachments = files.map((each, index) => ({
        name: each.name,
        url: filesUrls[index],
        size: each.size,
        mimeType: each.type,
      }));
    }

    await conversationChatMutation.trigger({
      message,
      channel: getConversationQuery?.data?.channel as string,
      attachments,
    });

    await getConversationQuery.mutate();
  };
  const handleChangeTab = useCallback(
    (tab: Tabs) => {
      router.query.tab = tab;
      router.replace(router, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  // Fetch single converstaion from query parameter (e.g: load converstaion from email notification)
  const getSingleConversationQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversation>
  >(targetConversationId ? `/api/logs/${targetConversationId}` : null, fetcher);

  const handleBannerAction = async ({
    conversationId,
    conversationStatus,
  }: {
    conversationId: string;
    conversationStatus: ConversationStatus;
  }) => {
    // await updateConversationStatus(conversationId, conversationStatus);

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
    if (getConversationQuery?.data) {
      setState({
        isAiEnabled: !!getConversationQuery?.data?.isAiEnabled,
      });
    }
  }, [getConversationQuery?.data?.isAiEnabled]);

  useEffect(() => {
    const found = conversations.find(
      (one) => one.id === state.currentConversationId
    );

    if (!state.currentConversationId || !found) {
      setState({
        currentConversationId:
          conversations.length >= 0 &&
          state.currentConversationIndex >= conversations.length
            ? conversations?.[conversations?.length - 1]?.id
            : conversations?.[state.currentConversationIndex]?.id,
      });
    }
  }, [conversations, state.currentConversationId]);

  useEffect(() => {
    if (getSingleConversationQuery?.data?.id) {
      setState({
        currentConversationId: getSingleConversationQuery?.data?.id,
      });
    }
  }, [getSingleConversationQuery?.data?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && router.isReady && !router.query.tab) {
      handleChangeTab(Tabs.unresolved);
    }
    setState({ currentConversationIndex: 0 });
  }, [router.query.tab, router.isReady, handleChangeTab]);

  useEffect(() => {
    if (getConversationQuery.isLoading || getConversationQuery.isValidating) {
      return;
    }
    setState({
      isAiEnabled: getConversationQuery?.data?.isAiEnabled ?? undefined,
    });
  }, [getConversationQuery?.data?.isAiEnabled]);

  const handleStatusChange = React.useCallback(
    async (status: ConversationStatus) => {
      try {
        // const nextConversationIndex =
        //   state.currentConversationIndex === conversations?.length - 1
        //     ? Math.max(0, state.currentConversationIndex - 1)
        //     : state.currentConversationIndex + 1;
        // const nextConversationId = conversations?.[nextConversationIndex]?.id;

        // if (nextConversationId) {
        //   setState({
        //     currentConversationId: nextConversationId,
        //     currentConversationIndex: nextConversationIndex,
        //   });
        // }

        await Promise.all([
          // getConversationQuery.mutate(),
          getConversationsQuery.mutate(),
        ]);

        // await handleBannerAction({
        //   conversationId: props.currentConversationId!,
        //   conversationStatus: {
        //     [ConversationStatus.RESOLVED]: ConversationStatus.UNRESOLVED,
        //     [ConversationStatus.UNRESOLVED]: ConversationStatus.RESOLVED,
        //     [ConversationStatus.HUMAN_REQUESTED]:
        //       ConversationStatus.RESOLVED,
        //   }[props.status],
        // });
      } catch {
      } finally {
        // setIsLoading(false);
      }
    },
    [handleBannerAction, getConversationsQuery.mutate]
  );

  if (!session?.organization) return null;

  if (
    !getConversationsQuery.isLoading &&
    conversations.length === 0 &&
    !hasFilterApplied
  ) {
    return (
      <Alert
        // variant="outlined"
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
        {/* {props.email && (
          <Input
            endDecorator={<CopyButton text={props.email} />}
            variant="outlined"
            value={props.email}
          ></Input>
        )} */}

        {/* {props.email && props.status === ConversationStatus.HUMAN_REQUESTED && (
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
        )} */}

        {/* <Button
          size="sm"
          loading={isLoading}
          color={
            {
              [ConversationStatus.RESOLVED]: 'danger',
              [ConversationStatus.UNRESOLVED]: 'success',
              [ConversationStatus.HUMAN_REQUESTED]: 'success',
            }[props.status] as ColorPaletteProp
          }
          onClick={handleStatusChange}
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
        </Button> */}
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

      <JoyTabs
        aria-label="tabs"
        value={(router.query.tab as string) || Tabs.all}
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
          <Tab indicatorInset value={Tabs.unresolved}>
            Unresolved
          </Tab>

          <Tab indicatorInset value={Tabs.unread}>
            Unread
          </Tab>

          <Tab indicatorInset value={Tabs.human_requested}>
            Human Requested
          </Tab>

          <Tab indicatorInset value={Tabs.all}>
            All
          </Tab>
        </TabList>
      </JoyTabs>
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
          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: { variant: 'outlined', color: 'neutral', size: 'sm' },
              }}
            >
              <MoreVertIcon />
            </MenuButton>
            <Menu placement="bottom-start" size="sm">
              <MenuItem
                disabled={markAllReadMutation.isMutating}
                onClick={async () => {
                  const confirmed = window.confirm(
                    'All messages that match the filters will be marked as read. Are you sure?'
                  );

                  if (!confirmed) return;

                  await toast.promise(markAllReadMutation.trigger(), {
                    loading: 'Updating...',
                    success: 'Updated',
                    error: 'Something went wrong',
                  });

                  getConversationsQuery.mutate();
                  getConversationQuery.mutate();
                }}
              >
                <ListItemDecorator>
                  <TaskAltRoundedIcon />
                </ListItemDecorator>
                Mark all messages as read
              </MenuItem>
              <MenuItem
                disabled={updateStatusAllMutation.isMutating}
                onClick={async () => {
                  const confirmed = window.confirm(
                    'All conversations that match the filters will be marked as resolved. Are you sure?'
                  );

                  if (!confirmed) return;

                  await toast.promise(
                    updateStatusAllMutation.trigger({
                      status: ConversationStatus.RESOLVED,
                    }),
                    {
                      loading: 'Updating...',
                      success: 'Updated',
                      error: 'Something went wrong',
                    }
                  );

                  getConversationsQuery.mutate();
                  getConversationQuery.mutate();
                }}
              >
                <ListItemDecorator>
                  <TaskAltRoundedIcon />
                </ListItemDecorator>
                Resolve all conversations
              </MenuItem>
            </Menu>
          </Dropdown>

          <SelectQueryParamFilter<EvalSchema>
            filterName="assigneeId"
            placeholder="Filter by Assignee"
          >
            {currentMembership && (
              <Option value={currentMembership.id} sx={{ fontSize: 14 }}>
                Me
              </Option>
            )}
            {getMembershipsQuery?.data
              ?.filter((each) => each.userId !== session?.user?.id)
              ?.map((each) => (
                <Option key={each.id} value={each.id} sx={{ fontSize: 14 }}>
                  {each?.user?.email || each?.user?.name}
                </Option>
              ))}
          </SelectQueryParamFilter>

          <SelectQueryParamFilter<ConversationChannel>
            filterName="channel"
            placeholder="Filter by Channel"
          >
            <Option
              key={ConversationChannel.mail}
              value={ConversationChannel.mail}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.mail}
            </Option>
            <Option
              key={ConversationChannel.website}
              value={ConversationChannel.website}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.website}
            </Option>
            <Option
              key={ConversationChannel.whatsapp}
              value={ConversationChannel.whatsapp}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.whatsapp}
            </Option>

            <Option
              key={ConversationChannel.api}
              value={ConversationChannel.api}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.api}
            </Option>
            <Option
              key={ConversationChannel.form}
              value={ConversationChannel.form}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.form}
            </Option>
            <Option
              key={ConversationChannel.dashboard}
              value={ConversationChannel.dashboard}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.dashboard}
            </Option>

            <Option
              key={ConversationChannel.crisp}
              value={ConversationChannel.crisp}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.crisp}
            </Option>
            <Option
              key={ConversationChannel.slack}
              value={ConversationChannel.slack}
              sx={{ fontSize: 14 }}
            >
              {ConversationChannel.slack}
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
          <SelectQueryParamFilter<EvalSchema>
            filterName="priority"
            placeholder="Filter by Priority"
          >
            <Option
              key={ConversationPriority.LOW}
              value={ConversationPriority.LOW}
              sx={{ fontSize: 14 }}
            >
              Low
            </Option>
            <Option
              key={ConversationPriority.MEDIUM}
              value={ConversationPriority.MEDIUM}
              sx={{ fontSize: 14 }}
            >
              Medium
            </Option>
            <Option
              key={ConversationPriority.HIGH}
              value={ConversationPriority.HIGH}
              sx={{ fontSize: 14 }}
            >
              High
            </Option>
          </SelectQueryParamFilter>
        </Stack>
        <Stack direction="row" spacing={2}>
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
                              <ArrowCircleRightRoundedIcon fontSize="xl2" />
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
                            gap={1}
                          >
                            <Typography
                              level="body-sm"
                              className="font-semibold truncate"
                            >
                              {(() => {
                                if (each?.participantsContacts?.length) {
                                  return (
                                    each?.participantsContacts?.[0]
                                      ?.firstName ||
                                    each?.participantsContacts?.[0]?.email ||
                                    each?.participantsContacts?.[0]?.phoneNumber
                                  );
                                }

                                if (each?.participantsVisitors?.[0]?.id) {
                                  return `Visitor${each?.participantsVisitors?.[0]?.id
                                    ?.slice(-2)
                                    .toUpperCase()}`;
                                }

                                if (
                                  each?.channel === ConversationChannel.mail &&
                                  each?.title
                                ) {
                                  return (
                                    each?.title || each?.messages?.[0]?.text
                                  );
                                }

                                if (!!each?.agent?.hidden) {
                                  return (each as any)?.form?.name || 'Form';
                                }

                                return each?.agent?.name;
                              })()}
                            </Typography>

                            {(each.metadata as any)?.country && (
                              <>
                                <Box
                                  sx={{
                                    minWidth: 16,
                                    minHeight: 16,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '100px',
                                    borderColor: 'divider',
                                    borderStyle: 'solid',
                                    borderWidth: 1,
                                    overflow: 'hidden',
                                    p: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 'auto',
                                  }}
                                >
                                  <ReactCountryFlag
                                    style={{
                                      fontSize: '16px',
                                    }}
                                    countryCode={(each.metadata as any).country}
                                    svg
                                  />
                                </Box>
                              </>
                            )}

                            <Stack direction="row" gap={0.5}>
                              <Typography
                                level="body-xs"
                                className="text-nowrap"
                              >
                                {relativeDate(each?.updatedAt)}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Stack
                            direction="row"
                            justifyContent={'space-between'}
                            alignItems={'start'}
                            gap={1}
                          >
                            <Typography
                              level="body-sm"
                              className="pr-4 line-clamp-2"
                            >
                              {/* last human message */}
                              {each?.messages?.[each?.messages.length - 1]
                                ?.from === 'human'
                                ? each?.messages?.[each?.messages.length - 1]
                                    ?.text
                                : each?.messages?.[each?.messages.length - 2]
                                    ?.text}
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
                              {'🚀 '}
                              {each?.channel}
                            </Chip>

                            {each?.channel === ConversationChannel.mail &&
                              each?.mailInbox?.name && (
                                <Chip
                                  size="sm"
                                  color="neutral"
                                  variant="outlined"
                                >
                                  {`📨 ${each?.mailInbox?.name}`}
                                </Chip>
                              )}
                            {!each?.agent?.hidden && !!each?.agent?.name && (
                              <Chip
                                size="sm"
                                color="neutral"
                                variant="outlined"
                              >
                                {'🤖 '}
                                {each?.agent?.name}
                              </Chip>
                            )}

                            {!!(each as any)?.form?.name && (
                              <Chip
                                size="sm"
                                color="neutral"
                                variant="outlined"
                              >
                                {'📄 '}
                                {(each as any)?.form?.name}
                              </Chip>
                            )}
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
            sx={{ width: '100%', height: '100%', overflow: 'hidden', pb: 9 }}
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
                    <Stack direction="row" spacing={1}>
                      <BannerActions
                        status={getConversationQuery?.data?.status}
                        email={getConversationQuery?.data?.lead?.email!}
                        currentConversationId={state.currentConversationId!}
                      />
                    </Stack>
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

            <Stack direction="row" sx={{ height: '100%', width: '100%' }}>
              <ChatBox
                messages={
                  getConversationQuery?.data?.messages?.map((each) => ({
                    id: each.id,
                    from: each.from,
                    message: each.text,
                    metadata: each.metadata as any,
                    createdAt: each.createdAt,
                    eval: each.eval,
                    approvals: each.approvals || [],
                    sources: (each.sources as any) || [],
                    attachments: each.attachments || [],
                    submission: each.submission!,
                    iconUrl: (each?.from === 'human'
                      ? each?.user?.customPicture || each?.user?.picture
                      : each?.agent?.iconUrl) as string,
                    fromName: (each?.from === 'human'
                      ? each?.user?.name ||
                        each?.contact?.email ||
                        each?.contact?.phoneNumber ||
                        (each?.visitorId ? `Visitor ${each?.visitorId}` : '')
                      : each?.agent?.name) as string,
                  })) || []
                }
                isLoadingConversation={getConversationQuery?.isLoading}
                onSubmit={(message, attachments) => {
                  return handleOperatorChat(message, attachments);
                }}
                readOnly={!!state.isAiEnabled || !state.currentConversationId}
                handleEvalAnswer={handleEvalAnswer}
                handleImprove={(message, index) => {
                  const prev =
                    getConversationQuery?.data?.messages?.[index - 1];

                  setState({
                    currentImproveAnswerID: message?.id,
                    improveAnswerDefaultValue: prev?.text,
                  });
                }}
                userImgUrl={session?.user?.image!}
                organizationId={session?.organization?.id!}
                refreshConversation={getConversationQuery.mutate}
                disableWatermark
                withFileUpload
                withSources
                isAiEnabled={getConversationQuery?.data?.isAiEnabled!}
                autoFocus
                draftReplyInput={
                  <DraftReplyInput
                    key={state.currentConversationId}
                    conversationId={state.currentConversationId}
                    defaultAgentId={getConversationQuery?.data?.agentId!}
                    onSubmit={({ query, agentId }) => {
                      console.log({ query, agentId });
                      // return handleOperatorChat(query || ' ', [], agentId);
                    }}
                  />
                }
              />

              <Divider orientation="vertical" />

              <Stack
                sx={(t) => ({
                  maxWidth: '300px',
                  width: '100%',
                  height: '100%',
                  // bgcolor: t.palette.background.paper,
                  // p: 2,
                })}
              >
                {state.currentConversationId && (
                  <InboxConversationSettings
                    key={state.currentConversationId}
                    conversationId={state.currentConversationId}
                    onStatusChange={handleStatusChange}
                    onDeleteConversationSuccess={() => {
                      getConversationsQuery.mutate();
                    }}
                  />
                )}
              </Stack>
            </Stack>
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

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {},
//     };
//   }
// );
