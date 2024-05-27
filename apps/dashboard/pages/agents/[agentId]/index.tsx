import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import SpokeRoundedIcon from '@mui/icons-material/SpokeRounded';
import {
  Alert,
  Breadcrumbs,
  CircularProgress,
  ColorPaletteProp,
} from '@mui/joy';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Stack from '@mui/joy/Stack';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Typography from '@mui/joy/Typography';
import { AgentModelName } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';

import AgentDeployTab from '@app/components/AgentDeployTab';
import AgentForm from '@app/components/AgentForm';
import HttpToolInput from '@app/components/AgentInputs/HttpToolInput';
import AgentSettingsTab from '@app/components/AgentSettingsTab';
import ChatSection from '@app/components/ChatSection';
import Layout from '@app/components/Layout';
import LeadCaptureToolFormInput from '@app/components/LeadCaptureToolForm/LeadCaptureToolFormInput';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useModal from '@app/hooks/useModal';

import agentToolFormat, {
  agentToolConfig,
} from '@chaindesk/lib/agent-tool-format';
import { ModelConfig } from '@chaindesk/lib/config';
import { RouteNames } from '@chaindesk/lib/types';
import { Tool } from '@chaindesk/prisma';
import Actions from '@chaindesk/ui/Chatbox/Actions';
import useAgent from '@chaindesk/ui/hooks/useAgent';
import useChat, { ChatContext } from '@chaindesk/ui/hooks/useChat';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import Loader from '@chaindesk/ui/Loader';

export default function AgentPage() {
  const router = useRouter();
  const agentId = router.query?.agentId as string;
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isUsageModalOpen: false,
    currentToolIndex: -1,
  });

  const { query } = useAgent({
    id: router.query?.agentId as string,
  });

  const methods = useChat({
    channel: 'dashboard',
    endpoint: router.query?.agentId
      ? `/api/agents/${router.query?.agentId}/query`
      : undefined,
  });

  const hasMarkAsResolvedTool = React.useMemo(
    () =>
      !!((query.data as any)?.tools as Tool[])?.find(
        (one) => one?.type === 'mark_as_resolved'
      ),
    [query.data]
  );
  const hasRequestHumanTool = React.useMemo(
    () =>
      !!((query.data as any)?.tools as Tool[])?.find(
        (one) => one?.type === 'request_human'
      ),
    [query.data]
  );

  const {
    history,
    handleChatSubmit,
    isLoadingConversation,
    hasMoreMessages,
    handleLoadMoreMessages,
    setConversationId,
    conversationId,
    handleEvalAnswer,
    handleAbort,
    refreshConversation,
    isStreaming,
    conversationAttachments,
  } = methods;

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.replace(router);
  };

  const editApiToolModal = useModal();
  const editLeadToolModal = useModal();

  const handleSelectConversation = (conversationId: string) => {
    setConversationId(conversationId);
    router.query.conversationId = conversationId || '';
    router.replace(router, undefined, { shallow: true });
  };

  const handleCreateNewChat = () => {
    handleAbort?.();
    setConversationId('');
    router.query.conversationId = '';
    router.replace(router, undefined, {
      shallow: true,
    });
  };
  React.useEffect(() => {
    if (router.isReady && typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab('chat');
    }
  }, [router.isReady, router.query.tab]);

  if (!query?.data) {
    return <Loader />;
  }

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        width: '100%',
        gap: 1,
      })}
    >
      <>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Stack
            gap={2}
            sx={{
              width: '100%',
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Breadcrumbs
                size="sm"
                aria-label="breadcrumbs"
                separator={<ChevronRightRoundedIcon />}
                sx={{
                  '--Breadcrumbs-gap': '1rem',
                  '--Icon-fontSize': '16px',
                  fontWeight: 'lg',
                  color: 'neutral.400',
                  px: 0,
                }}
              >
                <Link href={RouteNames.HOME}>
                  <HomeRoundedIcon />
                </Link>
                <Link href={RouteNames.AGENTS}>
                  <Typography
                    fontSize="inherit"
                    color="neutral"
                    className="hover:underline"
                  >
                    Agents
                  </Typography>
                </Link>
                <Typography
                  fontSize="inherit"
                  color="neutral"
                  className="hover:underline"
                >
                  {query?.data?.name}
                </Typography>
              </Breadcrumbs>

              <Chip
                size="sm"
                variant="soft"
                color={'primary'}
                onClick={() => {
                  router.query.tab = 'settings';
                  router.query.settingTab = 'model';
                  router.push(router);
                }}
              >
                {query?.data?.modelName}
              </Chip>
              <Chip
                size="sm"
                variant="soft"
                color={
                  {
                    public: 'success',
                    private: 'neutral',
                  }[query?.data?.visibility!] as ColorPaletteProp
                }
                onClick={() => {
                  router.query.tab = 'settings';
                  router.query.settingTab = 'security';
                  router.push(router);
                }}
              >
                {query?.data?.visibility}
              </Chip>
            </Box>

            <Stack direction={'row'} gap={2} alignItems={'center'}>
              <Tabs
                aria-label="tabs"
                value={(router.query.tab as string) || 'chat'}
                size="md"
                sx={{
                  bgcolor: 'transparent',
                  width: '100%',
                }}
                onChange={(event, value) => {
                  handleChangeTab(value as string);
                }}
              >
                <TabList
                  size="sm"
                  sx={{
                    [`&& .${tabClasses.root}`]: {
                      flex: 'initial',
                      bgcolor: 'transparent',
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                      [`&.${tabClasses.selected}`]: {
                        color: 'primary.plainColor',
                        '&::after': {
                          height: '3px',
                          borderTopLeftRadius: '3px',
                          borderTopRightRadius: '3px',
                          bgcolor: 'primary.500',
                        },
                      },
                    },
                  }}
                >
                  <Tab indicatorInset value={'chat'}>
                    <ListItemDecorator>
                      <MessageRoundedIcon />
                    </ListItemDecorator>
                    Chat
                  </Tab>
                  <Tab indicatorInset value={'deploy'}>
                    <ListItemDecorator>
                      <RocketLaunchRoundedIcon />
                    </ListItemDecorator>
                    Deploy
                  </Tab>
                  <Tab indicatorInset value={'settings'}>
                    <ListItemDecorator>
                      <SettingsIcon />
                    </ListItemDecorator>
                    Settings
                  </Tab>
                </TabList>
              </Tabs>
            </Stack>
          </Stack>
        </Box>

        {router.query.tab === 'chat' && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
              mt: -3,
            }}
          >
            <Stack
              direction="row"
              sx={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                overflow: 'hidden',
              }}
              gap={1}
            >
              <ChatContext.Provider value={methods}>
                <ChatSection
                  agentId={agentId}
                  organizationId={query?.data?.organizationId}
                  handleSelectConversation={handleSelectConversation}
                  currentConversationId={conversationId}
                  handleCreateNewChat={handleCreateNewChat}
                  disableWatermark
                  messages={history}
                  onSubmit={handleChatSubmit}
                  agentIconUrl={query?.data?.iconUrl!}
                  isLoadingConversation={isLoadingConversation}
                  hasMoreMessages={hasMoreMessages}
                  handleLoadMoreMessages={handleLoadMoreMessages}
                  handleEvalAnswer={handleEvalAnswer}
                  handleAbort={handleAbort}
                  userImgUrl={session?.user?.image!}
                  refreshConversation={refreshConversation}
                  withSources={!!query?.data?.includeSources}
                  autoFocus
                  isStreaming={isStreaming}
                  withFileUpload
                  conversationAttachments={conversationAttachments}
                  isAiEnabled
                  fromDashboard
                  actions={
                    <Actions
                      withHumanRequested={hasRequestHumanTool}
                      withMarkAsResolved={hasMarkAsResolvedTool}
                    />
                  }
                />
              </ChatContext.Provider>

              {(query?.data?.tools?.length || 0) > 0 && (
                <Box
                  sx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      display: 'none',
                    },
                    [theme.breakpoints.up('sm')]: {
                      width: '100%',
                      maxWidth: '250px',
                      maxHeight: '100%',
                      overflowY: 'auto',
                      pl: 2,
                      pt: 2,
                      pb: 2,
                      borderLeft: 1,
                      borderStyle: 'solid',
                      borderColor: 'divider',
                    },
                  })}
                >
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      level="body-lg"
                      startDecorator={<SpokeRoundedIcon fontSize="lg" />}
                    >
                      Tools
                    </Typography>
                    <IconButton
                      variant="plain"
                      size="sm"
                      onClick={() => {
                        router.query.tab = 'settings';
                        router.query.settingTab = 'tools';
                        router.replace(router);
                      }}
                    >
                      <SettingsIcon fontSize="md" />
                    </IconButton>
                  </Stack>
                  <Stack gap={1}>
                    {query?.data?.tools?.map((tool, index) => (
                      <>
                        <Card
                          key={tool.id}
                          variant="outlined"
                          size="sm"
                          color={(() => {
                            switch (tool.type) {
                              case 'lead_capture':
                                return 'warning';
                              case 'http':
                              // case 'mark_as_resolved':
                              case 'form':
                                // case 'request_human':
                                return ModelConfig[
                                  query?.data?.modelName as AgentModelName
                                ].isToolCallingSupported
                                  ? 'success'
                                  : 'warning';
                              default:
                                return 'success';
                            }
                          })()}
                        >
                          <Stack
                            direction="row"
                            sx={{
                              justifyContent: 'space-between',
                              width: '100%',
                              maxWidth: '100%',
                            }}
                          >
                            <Link
                              onClick={
                                tool.type === 'http'
                                  ? () => {
                                      setState({
                                        currentToolIndex: index,
                                      });
                                      editApiToolModal.open();
                                    }
                                  : tool.type === 'lead_capture'
                                  ? () => {
                                      setState({
                                        currentToolIndex: index,
                                      });
                                      editLeadToolModal.open();
                                    }
                                  : undefined
                              }
                              href={(() => {
                                switch (tool.type) {
                                  case 'datastore':
                                    return `/datastores/${tool?.datastoreId}`;
                                  case 'form':
                                    return `/forms/${tool?.formId}/admin`;
                                  default:
                                    return '#';
                                }
                              })()}
                              className="truncate"
                            >
                              <Typography
                                sx={{
                                  textDecoration: [
                                    'http',
                                    'datastore',
                                    'lead_capture',
                                  ].includes(tool.type)
                                    ? 'underline'
                                    : 'none',
                                }}
                                className="max-w-full truncate"
                                level="body-sm"
                              >
                                {agentToolFormat(tool as any)?.name ||
                                  tool?.type}
                              </Typography>
                            </Link>
                          </Stack>
                          <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between' }}
                          >
                            <Stack gap={1}>
                              <Chip size="sm">{tool?.type}</Chip>
                              {tool.type === 'lead_capture' && (
                                <Alert
                                  size="sm"
                                  color="warning"
                                  startDecorator={
                                    <InfoRoundedIcon sx={{ fontSize: 'sm' }} />
                                  }
                                >
                                  enabled on bubble/standard widgets only
                                </Alert>
                              )}

                              {[
                                'http',
                                // 'mark_as_resolved',
                                'form',
                                // 'request_human',
                              ].includes(tool.type) &&
                                !ModelConfig[
                                  query?.data?.modelName as AgentModelName
                                ].isToolCallingSupported && (
                                  <Alert
                                    size="sm"
                                    color="warning"
                                    startDecorator={
                                      <InfoRoundedIcon
                                        sx={{ fontSize: 'sm' }}
                                      />
                                    }
                                  >
                                    model not compatible
                                  </Alert>
                                )}
                            </Stack>

                            {(tool as any)?.datastore?._count?.datasources >
                              0 && (
                              <Chip
                                size="sm"
                                color="warning"
                                startDecorator={
                                  <CircularProgress
                                    color="warning"
                                    size="sm"
                                    sx={{
                                      '--_root-size': '9px',
                                    }}
                                  />
                                }
                              >
                                Running
                              </Chip>
                            )}

                            {(tool as any)?.datastore?._count?.datasources <=
                              0 && (
                              <Chip size="sm" color="success">
                                Synched
                              </Chip>
                            )}
                          </Stack>
                        </Card>
                      </>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>

            <editApiToolModal.component
              title="HTTP Tool"
              description="Let your Agent call an HTTP endpoint."
              dialogProps={{
                sx: {
                  maxWidth: 'md',
                  height: 'auto',
                },
              }}
            >
              {state.currentToolIndex >= 0 && (
                <AgentForm
                  agentId={agentId}
                  refreshQueryAfterMutation
                  onSubmitSucces={(agent) => {
                    editApiToolModal.close();
                  }}
                >
                  {({ mutation }) => (
                    <Stack gap={2}>
                      <HttpToolInput name={`tools.${state.currentToolIndex}`} />
                      <Button type="submit" loading={mutation.isMutating}>
                        Update
                      </Button>
                    </Stack>
                  )}
                </AgentForm>
              )}
            </editApiToolModal.component>
            <editLeadToolModal.component
              title={agentToolConfig.lead_capture.title}
              description={agentToolConfig.lead_capture.description}
              dialogProps={{
                sx: {
                  maxWidth: 'md',
                  height: 'auto',
                },
              }}
            >
              {state.currentToolIndex >= 0 && (
                <AgentForm
                  agentId={agentId}
                  refreshQueryAfterMutation
                  onSubmitSucces={(agent) => {
                    editLeadToolModal.close();
                  }}
                >
                  {({ mutation }) => (
                    <Stack gap={2}>
                      <LeadCaptureToolFormInput
                        name={`tools.${state.currentToolIndex}`}
                      />
                      <Button type="submit" loading={mutation.isMutating}>
                        Update
                      </Button>
                    </Stack>
                  )}
                </AgentForm>
              )}
            </editLeadToolModal.component>
          </Box>
        )}

        {
          <>
            {router.query.tab === 'deploy' && (
              <Box
                sx={(theme) => ({
                  width: '100%',
                  maxWidth: '100%',
                  height: '100%',
                  maxHeight: '100%',
                  overflowY: 'hidden',
                  mt: -3,
                })}
              >
                <Box
                  sx={{
                    height: '100%',
                    maxHeight: '100%',
                    py: 2,
                    overflowY: 'auto',
                  }}
                >
                  <AgentDeployTab agentId={router.query.agentId as string} />
                </Box>
              </Box>
            )}

            {router.query.tab === 'settings' && (
              <Box
                sx={(theme) => ({
                  width: '100%',
                  maxWidth: '100%',
                  height: '100%',
                  maxHeight: '100%',
                  overflow: 'hidden',
                  mt: -3,
                  // overflowY: 'auto',
                  // width: theme.breakpoints.values.md,
                  mx: 'auto',
                })}
              >
                <AgentSettingsTab agentId={router.query.agentId as string} />
              </Box>
            )}
          </>
        }
      </>

      <UsageLimitModal
        title="Upgrade to premium to use this feature"
        description="This feature is restricted to premium users only"
        isOpen={state.isUsageModalOpen}
        handleClose={() => {
          setState({
            isUsageModalOpen: false,
          });
        }}
      />
    </Box>
  );
}

AgentPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
