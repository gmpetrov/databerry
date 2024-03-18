import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseIcon from '@mui/icons-material/Close';
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
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import { Transition } from 'react-transition-group';

import useStateReducer from '@app/hooks/useStateReducer';
import { InitWidgetProps } from '@app/widgets/chatbox/common/types';

import pickColorBasedOnBgColor from '@chaindesk/lib/pick-color-based-on-bgcolor';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import type { Agent, Contact } from '@chaindesk/prisma';
import AnimateMessagesOneByOne from '@chaindesk/ui/Chatbox/AnimateMessagesOneByOne';
import ChatMessageCard from '@chaindesk/ui/Chatbox/ChatMessageCard';
import Markdown from '@chaindesk/ui/Markdown';

import ChatBoxFrame from './ChatBoxFrame';
import NewChatButton from './ChatboxNewChatButton';
import CustomerSupportActions from './CustomerSupportActions';
import Motion from './Motion';

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

export type BubbleProps = InitWidgetProps & {
  initConfig?: AgentInterfaceConfig;
};

const ChatBoxLayout = (props: {
  children?: any;
  imageUrl?: string;
  handleClose?: any;
  config?: AgentInterfaceConfig;
}) => {
  return (
    <Stack
      // className="relative px-4 pt-12 pb-2 w-full h-full"
      sx={{
        position: 'relative',
        px: 2,
        pt: 6,
        pb: 1,
        flex: 1,
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflowY: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          with: '100%',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100000000,
        }}
      >
        <Stack
          direction="row"
          sx={(t) => ({
            px: 2,
            py: 1,
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            // maxWidth: '700px',
            // mx: 'auto',
            // background: t.palette.background.body,
          })}
        >
          <Avatar
            size={'sm'}
            variant="outlined"
            sx={{ mr: 1 }}
            src={props?.imageUrl}
          />
          {/* {state.config?.displayName && ( */}
          <Typography
            level="body-lg"
            sx={(t) => ({
              fontFamily: 'Bricolage Grotesque',
              fontWeight: t.fontWeight.lg,
            })}
          >
            {props.config?.displayName}
          </Typography>
          {/* )} */}

          <Stack
            direction="row"
            sx={{
              ml: 'auto',
              alignItems: 'center',
            }}
          >
            <NewChatButton variant="plain" />

            {props.handleClose && (
              <IconButton
                variant="plain"
                size="sm"
                // onClick={() => setState({ isOpen: false })}
                onClick={props.handleClose}
              >
                <CloseRoundedIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>
      {props.children}
    </Stack>
  );
};

function App(props: BubbleProps) {
  const defaultAgentIconUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/images/chatbubble-default-icon-sm.gif`;

  // const { setMode } = useColorScheme();
  const initMessageRef = useRef(null);
  const chatBoxRef = useRef(null);

  const [state, setState] = useStateReducer({
    isOpen: false,
    agent: undefined as Agent | undefined,
    config: props.initConfig || defaultChatBubbleConfig,
    hasOpenOnce: false,
    showInitialMessage: false,
    visitorEmail: '',
    showLeadFormAfterMessageId: '',
  });

  // const methods = useChat({
  //   endpoint: `${API_URL}/api/agents/${props.agentId}/query`,
  //   channel: 'website',
  //   // channel: ConversationChannel.website // not working with bundler parcel,
  //   agentId: props?.agentId,
  //   localStorageConversationIdKey: `chatBubbleConversationId-${props.agentId}`,
  // contact: props?.contact,
  // context: props?.context,
  // });

  // const {
  //   history,
  //   handleChatSubmit,
  //   isLoadingConversation,
  //   hasMoreMessages,
  //   handleLoadMoreMessages,
  //   handleEvalAnswer,
  //   handleAbort,
  // } = methods;

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(
      state.config.primaryColor || '#ffffff',
      '#ffffff',
      '#000000'
    );
  }, [state.config.primaryColor]);

  // const isPremium = !!(state as any)?.agent?.organization?.subscriptions?.[0]
  //   ?.id;

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
        agent: {
          ...data,
          iconUrl: props?.initConfig?.iconUrl || data?.iconUrl,
        },
        config: {
          ...defaultChatBubbleConfig,
          ...agentConfig,
          ...props.initConfig,
        },
      });

      props?.onAgentLoaded?.(data);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  const initMessages = useMemo(() => {
    let msgs = [] as string[];
    if (!!props?.initConfig?.initialMessages?.length) {
      msgs = props?.initConfig.initialMessages;
    } else {
      msgs = state?.config?.initialMessages || [];
    }

    return msgs.map((each) => each?.trim?.()).filter((each) => !!each);
  }, [props?.initConfig?.initialMessages, state?.config?.initialMessages]);

  useEffect(() => {
    if (props.agentId) {
      handleFetchAgent();
    }
  }, [props.agentId]);

  useEffect(() => {
    let t: NodeJS.Timeout | null = null;

    if (initMessages?.length > 0 && !state.config?.isInitMessagePopupDisabled) {
      t = setTimeout(() => {
        setState({
          showInitialMessage: true,
        });
      }, 5000);
    }

    return () => {
      if (t) {
        clearTimeout(t);
      }
    };
  }, [initMessages?.length, state?.config?.isInitMessagePopupDisabled]);

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

  const handleClose = useCallback(() => {
    setState({ isOpen: false });
  }, []);

  const bubbleIcon = useMemo(() => {
    if (state.agent?.iconUrl) {
      return (
        <Avatar
          src={state.agent?.iconUrl}
          sx={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            ...props?.initConfig?.bubbleIconStyle,
          }}
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
  }, [state.agent?.iconUrl, props?.initConfig?.bubbleIconStyle]);

  const Layout = React.useMemo(() => {
    return (props: any) => (
      <ChatBoxLayout
        {...props}
        handleClose={handleClose}
        imageUrl={state?.agent?.iconUrl! || defaultAgentIconUrl}
      />
    );
  }, []);

  if (!state.agent) {
    return null;
  }

  return (
    <>
      {/* <ChatContext.Provider
        value={{
          ...methods,
        }}
      > */}
      {/* <Transition
          nodeRef={initMessageRef}
          in={state.showInitialMessage && !state.hasOpenOnce}
          timeout={0}
          mountOnEnter
          unmountOnExit
        >
          {(s) => ( */}
      {initMessages?.length > 0 &&
        state.showInitialMessage &&
        !state.hasOpenOnce && (
          <Stack
            ref={initMessageRef}
            className="chaindesk-init-messages"
            sx={{
              position: 'fixed',
              bottom: 100,
              // maxWidth: 'calc(100% - 75px)',

              maxWidth: {
                xs: '90%',
                sm: '500px',
              },

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
            gap={2}
          >
            <IconButton
              sx={{
                position: 'absolute',
                zIndex: 2,
                top: -2,

                transform: 'translate(0px, -125%)',
                p: 0.2,
                backgroundColor: 'white',
                minWidth: '10px',
                minHeight: '10px',
                borderRadius: '100%',
                // opacity: 0.6,

                ...(state.config.position === 'left'
                  ? {
                      right: 0,
                    }
                  : {}),
                ...(state.config.position === 'right'
                  ? {
                      right: 0,
                    }
                  : {}),
              }}
              variant="outlined"
              color="neutral"
              size="md"
              onClick={() =>
                setState({
                  showInitialMessage: false,
                })
              }
            >
              <CloseIcon fontSize="sm" />
            </IconButton>

            <AnimateMessagesOneByOne
              messages={initMessages.map((each) => ({
                iconUrl: state.agent?.iconUrl! || defaultAgentIconUrl,
                from: 'agent',
                message: each,
                approvals: [],
              }))}
            />

            {/* <motion.div
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
              <Stack gap={1} sx={{ position: 'relative' }}>
                <motion.div
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 100 },
                  }}
                >
                  <IconButton
                    sx={{
                      position: 'absolute',
                      zIndex: 2,
                      top: 0,

                      transform: 'translate(0px, -125%)',
                      p: 0.2,
                      backgroundColor: 'white',
                      minWidth: '10px',
                      minHeight: '10px',
                      // opacity: 0.6,

                      ...(state.config.position === 'left'
                        ? {
                            left: 0,
                          }
                        : {}),
                      ...(state.config.position === 'right'
                        ? {
                            right: 0,
                          }
                        : {}),
                    }}
                    variant="outlined"
                    color="neutral"
                    size="sm"
                    onClick={() =>
                      setState({
                        showInitialMessage: false,
                      })
                    }
                  >
                    <CloseIcon fontSize="sm" />
                  </IconButton>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        opacity: 1,
                        transition: {
                          when: 'beforeChildren',
                          staggerChildren: 1.5,
                        },
                      },
                      hidden: {
                        opacity: 0,
                        transition: {
                          when: 'afterChildren',
                        },
                      },
                    }}
                  >
                    <Stack
                      gap={1}
                      sx={{
                        ...(state.config.position === 'left'
                          ? {
                              alignItems: 'flex-start',
                            }
                          : {}),
                        ...(state.config.position === 'right'
                          ? {
                              alignItems: 'flex-end',
                            }
                          : {}),
                      }}
                    >
                      {initMessages?.map((each, index) => (
                        <motion.div
                          key={index}
                          variants={{
                            visible: { opacity: 1, y: 0 },
                            hidden: { opacity: 0, y: 100 },
                          }}
                        >
                          <ChatMessageCard
                            key={index}
                            onClick={() => {
                              setState({
                                isOpen: true,
                                hasOpenOnce: true,
                              });
                            }}
                            sx={{
                              maxWidth: 1000,
                              '&:hover': {
                                cursor: 'pointer',
                                transform: 'scale(1.025)',
                                transition: 'all 100ms ease-in-out',
                                justifySelf: 'flex-end',
                              },
                            }}
                          >
                            <Markdown>{each}</Markdown>
                          </ChatMessageCard>
                        </motion.div>
                      ))}
                    </Stack>
                  </motion.div>
                </motion.div>
              </Stack>
            </motion.div> */}
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
              {/* <Stack
                direction="row"
                sx={{
                  px: 2,
                  py: 1,
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderBottomColor: 'divider',
                }}
              >
                <Avatar
                  size={'sm'}
                  variant="outlined"
                  sx={{ mr: 1 }}
                  src={state.agent?.iconUrl! || defaultAgentIconUrl}
                />
                {state.config?.displayName && (
                  <Typography
                    level="body-lg"
                    sx={{ fontFamily: 'Bricolage Grotesque', fontWeight: 'lg' }}
                  >
                    {state.config?.displayName}
                  </Typography>
                )}

                <Stack
                  direction="row"
                  sx={{
                    ml: 'auto',
                    alignItems: 'center',
                  }}
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
              </Stack> */}
              <Stack
                sx={(theme) => ({
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
                  // px: 2,
                  // pb: 1,
                })}
              >
                {/* <ChatBox
                    messages={history}
                    onSubmit={handleChatSubmit}
                    messageTemplates={state.config.messageTemplates}
                    initialMessage={state.config.initialMessage}
                    initialMessages={initMessages}
                    agentIconUrl={state.agent?.iconUrl! || defaultAgentIconUrl}
                    agentIconStyle={props?.initConfig?.iconStyle}
                    isLoadingConversation={isLoadingConversation}
                    hasMoreMessages={hasMoreMessages}
                    handleLoadMoreMessages={handleLoadMoreMessages}
                    handleEvalAnswer={handleEvalAnswer}
                    handleAbort={handleAbort}
                    hideInternalSources
                    // renderBottom={
                    //   <CustomerSupportActions config={state.config} />
                    // }
                    withFileUpload
                    withSources={!!state?.agent?.includeSources}
                    isAiEnabled={methods.isAiEnabled}
                    disableWatermark={
                      isPremium && !!state?.config?.isBrandingDisabled
                    }
                  /> */}
                <ChatBoxFrame
                  agentId={props.agentId}
                  initConfig={state.config}
                  contact={props.contact}
                  context={props.context}
                  layout={Layout}
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
                ...props?.initConfig?.bubbleButtonStyle,
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
      {/* </ChatContext.Provider> */}
    </>
  );
}

export default App;
