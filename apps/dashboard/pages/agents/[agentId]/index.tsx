import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import SpokeRoundedIcon from '@mui/icons-material/SpokeRounded';
import { CircularProgress, ColorPaletteProp, IconButton } from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Stack from '@mui/joy/Stack';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Typography from '@mui/joy/Typography';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';

import AgentDeployTab from '@app/components/AgentDeployTab';
import AgentSettingsTab from '@app/components/AgentSettingsTab';
import ChatBox from '@app/components/ChatBox';
import ChatSection from '@app/components/ChatSection';
import ConversationList from '@app/components/ConversationList';
import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useAgent from '@app/hooks/useAgent';
import useChat from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';

import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';

export default function AgentPage() {
  const router = useRouter();
  const agentId = router.query?.agentId as string;
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isUsageModalOpen: false,
  });

  const { query } = useAgent({
    id: router.query?.agentId as string,
  });

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
  } = useChat({
    endpoint: router.query?.agentId
      ? `/api/agents/${router.query?.agentId}/query`
      : undefined,
  });

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.replace(router);
  };

  const handleSelectConversation = (conversationId: string) => {
    setConversationId(conversationId);
    router.replace(
      `/agents/${agentId}?tab=chat&conversationId=${conversationId}`,
      undefined,
      { shallow: true }
    );
  };
  const handleCreateNewChat = () => {
    setConversationId('');
    router.replace(`/agents/${agentId}?tab=chat&conversationId=`, undefined, {
      shallow: true,
    });
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab('chat');
    }
  }, [router.query.tab]);

  if (!query?.data) {
    return null;
  }

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pt: {
          // xs: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // sm: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // md: 3,
        },
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        // height: '100dvh',
        width: '100%',
        ...(router.query.tab === 'chat'
          ? {
              height: '100%',
            }
          : {}),
        gap: 1,
      })}
    >
      <>
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

          <Typography fontSize="inherit" color="neutral">
            {query?.data?.name}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1,
            mb: 2,
            gap: 1,
            flexWrap: 'wrap',
            // '& > *': {
            //   minWidth: 'clamp(0px, (500px - 100%) * 999, 100%)',
            //   flexGrow: 1,
            // },
          }}
        >
          <Stack
            gap={2}
            sx={{
              width: '100%',
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <Typography level="h1" fontSize="xl4">
                {query?.data?.name}
              </Typography>
              <Chip
                size="sm"
                variant="soft"
                color={
                  {
                    public: 'success',
                    private: 'neutral',
                  }[query?.data?.visibility!] as ColorPaletteProp
                }
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
                  // borderRadius: 'lg',
                  // display: 'inline-flex',
                  //   mt: 4,
                  bgcolor: 'transparent',
                  width: '100%',
                }}
                onChange={(event, value) => {
                  handleChangeTab(value as string);
                }}
              >
                <TabList
                  size="sm"
                  // disableUnderline={true}
                  // sx={{
                  //   p: 0.5,
                  //   gap: 0.5,
                  //   borderRadius: 'xl',
                  //   bgcolor: 'background.level1',
                  //   [`& .${tabClasses.root}[aria-selected="true"]`]: {
                  //     boxShadow: 'sm',
                  //     bgcolor: 'background.surface',
                  //   },
                  // }}

                  sx={{
                    // pt: 2,
                    // justifyContent: 'center',
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
              mb: -6,
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
              <ChatSection
                agentId={agentId}
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
              />

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
                    {query?.data?.tools?.map((tool) => (
                      <>
                        <Card key={tool.id} variant="outlined" size="sm">
                          <Stack
                            direction="row"
                            sx={{
                              justifyContent: 'space-between',
                              width: '100%',
                              maxWidth: '100%',
                            }}
                          >
                            <Link
                              href={`/datastores/${tool?.datastoreId}`}
                              className="truncate"
                            >
                              <Typography
                                sx={{ textDecoration: 'underline' }}
                                className="max-w-full truncate"
                                level="body-sm"
                              >
                                {(tool as any)?.datastore?.name}
                              </Typography>
                            </Link>
                          </Stack>
                          <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between' }}
                          >
                            <Chip size="sm">{tool?.type}</Chip>

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
          </Box>
        )}

        {
          <Box
            sx={(theme) => ({
              width: '100%',
              maxWidth: '100%',
              // width: theme.breakpoints.values.md,
              mx: 'auto',
            })}
          >
            {router.query.tab === 'deploy' && (
              <AgentDeployTab agentId={router.query.agentId as string} />
            )}

            {router.query.tab === 'settings' && (
              <AgentSettingsTab agentId={router.query.agentId as string} />
            )}
          </Box>
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

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
