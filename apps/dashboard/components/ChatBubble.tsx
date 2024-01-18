import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import colors from '@mui/joy/colors';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import { extendTheme, useColorScheme } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef } from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { Transition } from 'react-transition-group';

import ChatBox from '@app/components/ChatBox';
import useChat, { ChatContext } from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';

import pickColorBasedOnBgColor from '@chaindesk/lib/pick-color-based-on-bgcolor';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import type { Agent } from '@chaindesk/prisma';

import ChatMessageCard from './ChatMessageCard';
import CustomerSupportActions from './CustomerSupportActions';
import Markdown from './Markdown';
import Motion from './Motion';
import NewChatButton from './NewChatButton';

const defaultChatBubbleConfig: AgentInterfaceConfig = {
  // displayName: 'Agent Smith',
  theme: 'light',
  primaryColor: '#000000',
  position: 'left',
  // initialMessage: 'Hi, how can I help you?',
  // position: 'right',
  // messageTemplates: ["What's the pricing?"],
};

export const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

function App(props: {
  agentId: string;
  initConfig?: AgentInterfaceConfig;
  onAgentLoaded?: (agent: Agent) => any;
}) {
  // const { setMode } = useColorScheme();
  const initMessageRef = useRef(null);
  const chatBoxRef = useRef(null);

  const defaultAgentIconUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/images/chatbubble-default-icon-sm.gif`;

  const [state, setState] = useStateReducer({
    isOpen: false,
    agent: undefined as Agent | undefined,
    config: props.initConfig || defaultChatBubbleConfig,
    hasOpenOnce: false,
    showInitialMessage: false,
    visitorEmail: '',
    showLeadFormAfterMessageId: '',
  });

  const methods = useChat({
    endpoint: `${API_URL}/api/agents/${props.agentId}/query`,
    channel: 'website',
    // channel: ConversationChannel.website // not working with bundler parcel,
    agentId: props?.agentId,
    localStorageConversationIdKey: `chatBubbleConversationId-${props.agentId}`,
  });

  const {
    history,
    handleChatSubmit,
    isLoadingConversation,
    hasMoreMessages,
    handleLoadMoreMessages,
    handleEvalAnswer,
    handleAbort,
  } = methods;

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(
      state.config.primaryColor || '#ffffff',
      '#ffffff',
      '#000000'
    );
  }, [state.config.primaryColor]);

  const isPremium = !!(state as any)?.agent?.organization?.subscriptions?.[0]
    ?.id;

  // TODO: find why onSuccess is not working
  // useSWR<Agent>(`${API_URL}/api/agents/${agentId}`, fetcher, {
  //   onSuccess: (data) => {
  //     const agentConfig = data?.interfaceConfig as AgentInterfaceConfig;

  //     setAgent(data);
  //     setConfig({
  //       ...defaultChatBubbleConfig,
  //       ...agentConfig,
  //     });
  //   },
  //   onError: (err) => {
  //     console.error(err);
  //   },
  // });

  const handleFetchAgent = async () => {
    try {
      const res = await fetch(`${API_URL}/api/agents/${props.agentId}`);
      const data = (await res.json()) as Agent;

      const agentConfig = data?.interfaceConfig as AgentInterfaceConfig;

      setState({
        agent: data,
        config: {
          ...defaultChatBubbleConfig,
          ...agentConfig,
        },
      });

      props?.onAgentLoaded?.(data);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    if (props.agentId) {
      handleFetchAgent();
    }
  }, [props.agentId]);

  useEffect(() => {
    if (
      state.config?.initialMessage &&
      !state.config?.isInitMessagePopupDisabled
    ) {
      setTimeout(() => {
        setState({
          showInitialMessage: true,
        });
      }, 5000);
    }
  }, [state?.config?.initialMessage]);

  useEffect(() => {
    if (props.initConfig) {
      setState({
        config: props.initConfig,
      });
    }
  }, [props.initConfig]);

  const transitionStyles = {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 },
  };

  const bubbleIcon = useMemo(() => {
    if (state.agent?.iconUrl) {
      return (
        <Avatar
          src={state.agent?.iconUrl}
          sx={{ width: '100%', height: '100%' }}
        />
      );
      // return <img src={state.agent?.iconUrl} width="100%" height="100%" />;
    } else {
      // return <AutoAwesomeIcon />;
      return (
        <Avatar
          src={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/images/chatbubble-default-icon-sm.gif`}
          sx={{ width: '100%', height: '100%' }}
        />
      );
    }
  }, [state.agent?.iconUrl]);

  if (!state.agent) {
    return null;
  }

  return (
    <>
      <ChatContext.Provider
        value={{
          ...methods,
        }}
      >
        {/* <Transition
          nodeRef={initMessageRef}
          in={state.showInitialMessage && !state.hasOpenOnce}
          timeout={0}
          mountOnEnter
          unmountOnExit
        >
          {(s) => ( */}
        {state.config?.initialMessage &&
          state.showInitialMessage &&
          !state.hasOpenOnce && (
            <Stack
              ref={initMessageRef}
              className="chaindesk-init-messages"
              sx={{
                position: 'fixed',
                bottom: 100,
                maxWidth: 'calc(100% - 75px)',

                zIndex: 9999999998,
                // opacity: 0,
                // transition: `opacity 300ms ease-in-out`,
                // ...(transitionStyles as any)[s],

                ...(state.config.position === 'left'
                  ? {
                      left: '20px',
                    }
                  : {}),
                ...(state.config.position === 'right'
                  ? {
                      right: '20px',
                    }
                  : {}),
              }}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      when: 'beforeChildren',
                      staggerChildren: 0.3,
                    },
                  },
                  hidden: {
                    opacity: 0,
                    y: 100,
                    transition: {
                      when: 'afterChildren',
                    },
                  },
                }}
              >
                <Stack spacing={1}>
                  <motion.div
                    variants={{
                      visible: { opacity: 1, y: 0 },
                      hidden: { opacity: 0, y: 100 },
                    }}
                  >
                    <ChatMessageCard
                      sx={{
                        maxWidth: 1000,
                      }}
                    >
                      <Markdown>{state.config?.initialMessage}</Markdown>
                    </ChatMessageCard>
                  </motion.div>
                </Stack>
              </motion.div>
            </Stack>
          )}

        <Box
          className="chaindesk-widget"
          sx={{
            // bgcolor: 'red',
            overflow: 'visible',
            position: 'fixed',
            height: '60px',
            bottom: '20px',
            zIndex: 9999999999,

            ...(state.config.position === 'left'
              ? {
                  left: '20px',
                }
              : {}),
            ...(state.config.position === 'right'
              ? {
                  right: '20px',
                }
              : {}),
          }}
        >
          {/* <Transition
            nodeRef={chatBoxRef}
            in={state.isOpen}
            timeout={0}
            mountOnEnter
            unmountOnExit
          >
            {(s) => ( */}

          {/* <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: state.isOpen ? 1 : 0,
            }}
            exit={{
              opacity: 0,
            }}
            style={
              {
                // transformOrigin: 'center',
              }
            }
          > */}
          <Motion
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: state.isOpen ? 1 : 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            {({ ref }: any) => (
              <Card
                //  ref={chatBoxRef}
                ref={ref as any}
                variant="outlined"
                sx={(theme) => ({
                  pointerEvents: state.isOpen ? 'all' : 'none',
                  // visibility: state.isOpen ? 'visible' : 'hidden',
                  zIndex: 9999,
                  position: 'absolute',
                  bottom: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  background: 'white',
                  p: 0,
                  gap: 0,
                  // boxShadow: 'md',

                  opacity: 1,
                  // transition: `opacity 150ms ease-in-out`,
                  // ...(transitionStyles as any)[s],

                  ...(state.config.position === 'right'
                    ? {
                        transform: `translateX(${-500 + 50}px)`,
                      }
                    : {}),

                  [theme.breakpoints.up('sm')]: {
                    width: '500px',
                  },
                  [theme.breakpoints.only('xs')]: {
                    width: '100vw',
                    height: '100dvh',
                    maxWidth: '100vw',
                    position: 'fixed',

                    left: 0,
                    top: 0,
                    transform: `translateX(0px)`,

                    // ...(state.config.position === 'left'
                    //   ? {
                    //       left: '-20px',
                    //     }
                    //   : {}),
                    // ...(state.config.position === 'right'
                    //   ? {
                    //       transform: `translateX(0px)`,
                    //       right: '-20px',
                    //     }
                    //   : {}),
                  },
                })}
              >
                <Stack
                  direction="row"
                  sx={{
                    px: 2,
                    py: 1,
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderBottomColor: 'divider',
                  }}
                >
                  {state.config?.displayName && (
                    <Typography>{state.config?.displayName}</Typography>
                  )}

                  <Stack
                    direction="row"
                    sx={{ ml: 'auto', alignItems: 'center' }}
                  >
                    <NewChatButton variant="plain" />

                    <IconButton
                      variant="plain"
                      size="sm"
                      onClick={() => setState({ isOpen: false })}
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Stack>
                </Stack>
                <Stack
                  sx={(theme) => ({
                    // flex: 1,
                    // display: 'flex',
                    position: 'relative',

                    height: '100%',
                    maxHeight: '100%',
                    flex: 1,
                    padding: 0,

                    [theme.breakpoints.up('sm')]: {
                      minHeight: '680px',
                      maxHeight: '680px',
                    },
                    [theme.breakpoints.only('xs')]: {
                      height: '100%',
                      maxWidth: '100vw',
                    },

                    '& .message-agent': {},
                    '& .message-human': {
                      backgroundColor: state.config.primaryColor,
                    },
                    '& .message-human *': {
                      color: textColor,
                    },

                    overflowY: 'hidden',
                    px: 2,
                    pb: 1,
                  })}
                >
                  {/* <iframe
                    style={{
                      width: '100%',
                      height: '100vh',
                    }}
                    src={`http://localhost:3000/agents/${props.agentId}/iframe`}
                    // src={`https://www.chaindesk.ai/agents/clq6g5cuv000wpv8iddswwvnd/iframe`}
                    frameBorder="0"
                  /> */}
                  <ChatBox
                    messages={history}
                    onSubmit={handleChatSubmit}
                    messageTemplates={state.config.messageTemplates}
                    initialMessage={state.config.initialMessage}
                    agentIconUrl={state.agent?.iconUrl! || defaultAgentIconUrl}
                    isLoadingConversation={isLoadingConversation}
                    hasMoreMessages={hasMoreMessages}
                    handleLoadMoreMessages={handleLoadMoreMessages}
                    handleEvalAnswer={handleEvalAnswer}
                    handleAbort={handleAbort}
                    hideInternalSources
                    renderBottom={
                      <CustomerSupportActions config={state.config} />
                    }
                    withFileUpload
                    withSources={!!state?.agent?.includeSources}
                    isAiEnabled={methods.isAiEnabled}
                    disableWatermark={
                      isPremium && !!state?.config?.isBrandingDisabled
                    }
                  />
                </Stack>
              </Card>
            )}
          </Motion>
          {/* </motion.div> */}
          {/* )}
          </Transition> */}

          <Motion
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                y: 0,
                transition: {
                  when: 'beforeChildren',
                  staggerChildren: 0.3,
                },
              },
              hidden: {
                y: 100,
                transition: {
                  when: 'afterChildren',
                },
              },
            }}
          >
            {({ ref }) => (
              <IconButton
                // color={'neutral'}
                ref={ref}
                variant="solid"
                className="chaindesk-launcher"
                onClick={() =>
                  setState({
                    isOpen: !state.isOpen,
                    ...(!state.isOpen
                      ? {
                          hasOpenOnce: true,
                        }
                      : {}),
                  })
                }
                sx={(theme) => ({
                  backgroundColor: state.config.primaryColor,
                  width: '60px',
                  height: '60px',
                  borderRadius: '100%',
                  color: textColor,
                  // transition: 'all 100ms ease-in-out',
                  borderWidth: '0.5px',
                  borderColor: theme.palette.divider,
                  borderStyle: 'solid',
                  p: '0',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: state.config.primaryColor,
                    filter: 'brightness(0.9)',
                    transform: 'scale(1.05)',
                  },
                })}
              >
                <AnimatePresence>
                  {state.isOpen && (
                    <Motion
                      variants={{
                        visible: {
                          rotate: '0deg',
                        },
                        hidden: {
                          rotate: '-180deg',
                        },
                      }}
                    >
                      {({ ref }) => <ClearRoundedIcon ref={ref} />}
                    </Motion>
                  )}

                  {
                    !state.isOpen &&
                      // <motion.div style={{ width: '100%', height: '100%' }}>
                      bubbleIcon
                    // </motion.div>
                  }
                </AnimatePresence>
              </IconButton>
            )}
          </Motion>
        </Box>
      </ChatContext.Provider>
    </>
  );
}

export default App;
