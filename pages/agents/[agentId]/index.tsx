import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import IntegrationInstructionsRoundedIcon from '@mui/icons-material/IntegrationInstructionsRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  Avatar,
  ColorPaletteProp,
  IconButton,
  List,
  ListItem,
  ListItemButton,
} from '@mui/joy';
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Stack from '@mui/joy/Stack';
import Tab from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Typography from '@mui/joy/Typography';
import {
  Agent,
  AgentVisibility,
  DatastoreVisibility,
  Prisma,
  ToolType,
} from '@prisma/client';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import AgentForm from '@app/components/AgentForm';
import ChatBox from '@app/components/ChatBox';
import ChatBubble from '@app/components/ChatBubble';
import ConversationList from '@app/components/ConversationList';
import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useChat from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';
import { getAgent, updateAgent } from '@app/pages/api/agents/[id]';
import { RouteNames } from '@app/types';
import agentToolFormat from '@app/utils/agent-tool-format';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

const SlackBotModal = dynamic(
  () => import('@app/components/SlackSettingsModal'),
  {
    ssr: false,
  }
);

const CrispSettingsModal = dynamic(
  () => import('@app/components/CrispSettingsModal'),
  {
    ssr: false,
  }
);

const IFrameWidgetSettingsModal = dynamic(
  () => import('@app/components/IFrameWidgetSettings'),
  {
    ssr: false,
  }
);

const BubbleWidgetSettingsModal = dynamic(
  () => import('@app/components/BubbleWidgetSettings'),
  {
    ssr: false,
  }
);

const StandalonePageWidgetSettingsModal = dynamic(
  () => import('@app/components/StandalonePageWidgetSettings'),
  {
    ssr: false,
  }
);

export default function AgentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isSlackModalOpen: false,
    isUsageModalOpen: false,
    isCrispModalOpen: false,
    isBubbleWidgetModalOpen: false,
    isIFrameWidgetModalOpen: false,
    isStandalonePageWidgetModalOpen: false,
  });

  const getAgentQuery = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    `/api/agents/${router.query?.agentId}`,
    fetcher
  );

  const updateAgentMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateAgent>
  >(
    `/api/agents/${router.query?.agentId}`,
    generateActionFetcher(HTTP_METHOD.PATCH)
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
  } = useChat({
    endpoint: router.query?.agentId
      ? `/api/agents/${router.query?.agentId}/query`
      : undefined,
  });

  const handleDeleteAgent = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this agent? This action is irreversible.'
      )
    ) {
      await axios.delete(`/api/agents/${getAgentQuery?.data?.id}`);

      router.push(RouteNames.AGENTS);
    }
  };

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.replace(router);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab('chat');
    }
  }, [router.query.tab]);

  React.useEffect(() => {
    setConversationId(router.query.conversationId as string);
  }, [router.query.conversationId]);

  React.useEffect(() => {
    router.query.conversationId = conversationId;
    router.replace(router, undefined, { shallow: true });
  }, [conversationId]);

  if (!getAgentQuery?.data) {
    return null;
  }

  const agent = getAgentQuery?.data;
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
            {getAgentQuery?.data?.name}
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
          <Stack gap={2}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <Typography level="h1" fontSize="xl4">
                {getAgentQuery?.data?.name}
              </Typography>
              <Chip
                size="sm"
                variant="soft"
                color={
                  {
                    public: 'success',
                    private: 'neutral',
                  }[getAgentQuery?.data?.visibility!] as ColorPaletteProp
                }
              >
                {getAgentQuery?.data?.visibility}
              </Chip>
            </Box>

            <Stack direction={'row'} gap={2} alignItems={'center'}>
              <Tabs
                aria-label="Icon tabs"
                value={(router.query.tab as string) || 'chat'}
                size="md"
                sx={{
                  borderRadius: 'lg',
                  display: 'inline-flex',
                  //   mt: 4,
                }}
                onChange={(event, value) => {
                  handleChangeTab(value as string);
                }}
              >
                <TabList size="sm">
                  <Tab value={'chat'}>
                    <ListItemDecorator>
                      <MessageRoundedIcon />
                    </ListItemDecorator>
                    Chat
                  </Tab>
                  <Tab value={'deploy'}>
                    <ListItemDecorator>
                      <RocketLaunchRoundedIcon />
                    </ListItemDecorator>
                    Deploy
                  </Tab>
                  <Tab value={'settings'}>
                    <ListItemDecorator>
                      <SettingsIcon />
                    </ListItemDecorator>
                    Settings
                  </Tab>
                </TabList>
              </Tabs>

              {/* {router.query.tab === 'settings' && (
                <>
                  <Link href={`#chat-interface-config`}>
                    <Button
                      size="sm"
                      variant="plain"
                      startDecorator={<PaletteRoundedIcon />}
                      sx={{ mr: 'auto' }}
                    >
                      Customize interface
                    </Button>
                  </Link>

                  <Link href={`#embed`}>
                    <Button
                      size="sm"
                      variant="plain"
                      startDecorator={<IntegrationInstructionsRoundedIcon />}
                      sx={{ mr: 'auto' }}
                    >
                      Embed on website
                    </Button>
                  </Link>
                </>
              )} */}
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {router.query.tab === 'chat' && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
              mt: -5,
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
              <Box
                sx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    display: 'none',
                  },
                })}
              >
                <ConversationList
                  agentId={router.query?.agentId as string}
                  rootSx={{
                    pt: 1,
                    height: '100%',
                    width: '200px',
                  }}
                />
              </Box>

              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  pb: 2,
                }}
              >
                <ChatBox
                  disableWatermark
                  messages={history}
                  onSubmit={handleChatSubmit}
                  agentIconUrl={getAgentQuery?.data?.iconUrl!}
                  isLoadingConversation={isLoadingConversation}
                  hasMoreMessages={hasMoreMessages}
                  handleLoadMoreMessages={handleLoadMoreMessages}
                  handleEvalAnswer={handleEvalAnswer}
                  handleAbort={handleAbort}
                  userImgUrl={session?.user?.image!}
                />
              </Box>
            </Stack>
          </Box>
        )}

        {
          <Box
            sx={(theme) => ({
              maxWidth: '100%',
              width: theme.breakpoints.values.md,
              mx: 'auto',
            })}
          >
            {router.query.tab === 'deploy' && (
              <>
                <Typography level="h5">
                  Deploy Agent to the following services
                </Typography>

                <List variant="outlined" sx={{ mt: 2 }}>
                  {[
                    {
                      name: 'Website (bubble widget)',
                      // icon: <LanguageRoundedIcon sx={{ fontSize: 32 }} />,
                      icon: (
                        <IconButton
                          size="sm"
                          variant="solid"
                          sx={(theme) => ({
                            // backgroundColor: state.config.primaryColor,
                            borderRadius: '100%',
                          })}
                        >
                          <AutoAwesomeIcon />
                        </IconButton>
                      ),
                      action: () => {
                        setState({
                          isBubbleWidgetModalOpen: true,
                        });
                      },
                      publicAgentRequired: true,
                    },
                    {
                      name: 'Standalone WebPage',
                      icon: <Typography sx={{ fontSize: 32 }}>💅</Typography>,
                      action: () => {
                        setState({
                          isStandalonePageWidgetModalOpen: true,
                        });
                      },
                      publicAgentRequired: true,
                    },
                    {
                      name: 'iFrame',
                      icon: <Typography sx={{ fontSize: 32 }}>📺</Typography>,
                      action: () => {
                        setState({
                          isIFrameWidgetModalOpen: true,
                        });
                      },
                      publicAgentRequired: true,
                    },
                    {
                      name: 'Slack',
                      icon: (
                        <Image
                          className="w-8"
                          src="/slack-logo.png"
                          width={100}
                          height={100}
                          alt="slack logo"
                        ></Image>
                      ),
                      isPremium: true,
                      action: () => {
                        setState({ isSlackModalOpen: true });
                      },
                    },
                    {
                      name: 'Crisp',
                      isPremium: true,
                      icon: (
                        <Image
                          className="w-20"
                          src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Logo_de_Crisp.svg"
                          width={20}
                          height={20}
                          alt="crisp logo"
                        ></Image>
                      ),
                      action: () => {
                        setState({ isCrispModalOpen: true });
                      },
                    },
                    {
                      name: 'Zapier',
                      isPremium: true,
                      icon: (
                        <img
                          className="w-8"
                          src="https://images.ctfassets.net/lzny33ho1g45/6YoKV9RS3goEx54iFv96n9/78100cf9cba971d04ac52d927489809a/logo-symbol.png"
                          alt="zapier logo"
                        ></img>
                      ),

                      action: () => {
                        window.open(
                          'https://zapier.com/apps/databerry/integrations',
                          '_blank'
                        );
                      },
                    },
                  ].map((each, index, arr) => (
                    <ListItem
                      key={index}
                      sx={(theme) => ({
                        borderBottomWidth: index < arr.length - 1 ? 0.1 : 0,
                        borderBottomColor: theme.palette.divider,
                      })}
                    >
                      {/* <ListItemButton> */}
                      <Stack direction="row" gap={2} alignItems={'center'}>
                        {each.icon}
                        <Typography fontWeight={'bold'}>{each.name}</Typography>

                        {each.isPremium && (
                          <Chip color="warning" size="sm" variant="soft">
                            premium
                          </Chip>
                        )}
                      </Stack>

                      {(!each?.isPremium ||
                        (each.isPremium && session?.organization?.isPremium)) &&
                        (each?.publicAgentRequired &&
                        agent?.visibility === DatastoreVisibility.private ? (
                          <Button
                            size="sm"
                            variant="outlined"
                            startDecorator={<ToggleOffIcon />}
                            sx={{ ml: 'auto' }}
                            loading={updateAgentMutation.isMutating}
                            onClick={async () => {
                              const accepted = await confirm(
                                'This feature requires your Agent to be public. Unauthenticated users (visitors) can query it. Make it public?'
                              );

                              if (!accepted) {
                                return;
                              }

                              await updateAgentMutation.trigger({
                                ...agent,
                                visibility: AgentVisibility.public,
                              } as any);

                              await getAgentQuery.mutate();
                            }}
                          >
                            Enable
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outlined"
                            startDecorator={<TuneRoundedIcon />}
                            sx={{ ml: 'auto' }}
                            onClick={each.action}
                          >
                            Settings
                          </Button>
                        ))}

                      {each.isPremium && !session?.organization?.isPremium && (
                        <Button
                          size="sm"
                          variant="outlined"
                          color="warning"
                          sx={{ ml: 'auto' }}
                          onClick={() => setState({ isUsageModalOpen: true })}
                        >
                          Subscribe
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>

                {getAgentQuery?.data?.id! && (
                  <>
                    <SlackBotModal
                      agentId={getAgentQuery?.data?.id!}
                      isOpen={state.isSlackModalOpen}
                      handleCloseModal={() =>
                        setState({ isSlackModalOpen: false })
                      }
                    />

                    <CrispSettingsModal
                      agentId={getAgentQuery?.data?.id!}
                      isOpen={state.isCrispModalOpen}
                      handleCloseModal={() =>
                        setState({ isCrispModalOpen: false })
                      }
                    />

                    <BubbleWidgetSettingsModal
                      agentId={getAgentQuery?.data?.id!}
                      isOpen={state.isBubbleWidgetModalOpen}
                      handleCloseModal={() =>
                        setState({ isBubbleWidgetModalOpen: false })
                      }
                    />

                    <IFrameWidgetSettingsModal
                      agentId={getAgentQuery?.data?.id!}
                      isOpen={state.isIFrameWidgetModalOpen}
                      handleCloseModal={() =>
                        setState({ isIFrameWidgetModalOpen: false })
                      }
                    />

                    <StandalonePageWidgetSettingsModal
                      agentId={getAgentQuery?.data?.id!}
                      isOpen={state.isStandalonePageWidgetModalOpen}
                      handleCloseModal={() =>
                        setState({ isStandalonePageWidgetModalOpen: false })
                      }
                    />
                  </>
                )}
              </>
            )}

            {router.query.tab === 'settings' && (
              <>
                <AgentForm
                  onSubmitSucces={() => getAgentQuery.mutate()}
                  defaultValues={{
                    ...getAgentQuery?.data,
                    interfaceConfig: getAgentQuery?.data
                      ?.interfaceConfig as any,
                    tools: [
                      ...agent.tools.map((each) => agentToolFormat(each)),
                    ],
                  }}
                  agentId={agent?.id}
                />
                <Divider sx={{ my: 4 }} />
                <FormControl sx={{ gap: 1 }}>
                  <FormLabel>Agent ID</FormLabel>
                  <Typography level="body3" mb={2}>
                    Use the Agent ID to query the agent through ChatbotGPT API
                  </Typography>
                  <Stack spacing={2}>
                    <Alert
                      color="info"
                      startDecorator={<HelpOutlineRoundedIcon />}
                      endDecorator={
                        <Link href="https://docs.chaindesk.ai" target="_blank">
                          <Button
                            variant="plain"
                            size="sm"
                            endDecorator={<ArrowForwardRoundedIcon />}
                          >
                            Documentation
                          </Button>
                        </Link>
                      }
                    >
                      Learn more about the Datatberry API
                    </Alert>

                    <Alert
                      color="neutral"
                      sx={{
                        cursor: 'copy',
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(getAgentQuery?.data?.id!);
                        toast.success('Copied!', {
                          position: 'bottom-center',
                        });
                      }}
                    >
                      {getAgentQuery?.data?.id}
                    </Alert>
                  </Stack>
                </FormControl>

                <Divider sx={{ my: 4 }} />
                <FormControl sx={{ gap: 1 }}>
                  <FormLabel>Delete Agent</FormLabel>
                  <Typography level="body3">
                    It will delete the agent permanently
                  </Typography>

                  <Button
                    color="danger"
                    sx={{ mr: 'auto', mt: 2 }}
                    startDecorator={<DeleteIcon />}
                    onClick={handleDeleteAgent}
                  >
                    Delete
                  </Button>
                </FormControl>
              </>
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
