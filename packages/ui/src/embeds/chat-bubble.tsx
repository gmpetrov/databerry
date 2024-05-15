import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseIcon from '@mui/icons-material/Close';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Base, { ChatBaseProps } from '@chaindesk/ui/embeds/chat-base';
import pickColorBasedOnBgColor from '@chaindesk/lib/pick-color-based-on-bgcolor';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import type { Agent, Contact } from '@chaindesk/prisma';
import AnimateMessagesOneByOne from '@chaindesk/ui/Chatbox/AnimateMessagesOneByOne';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import Motion from '@chaindesk/ui/Motion';
import { InitWidgetProps } from './types';

import NewChatButton from '@chaindesk/ui/Chatbox/NewChatButton';

import { zIndex } from '@chaindesk/ui/embeds/common/utils';

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

export type BubbleProps = InitWidgetProps &
  ChatBaseProps & {
    isOpen?: boolean;
  };

const ChatBoxLayout = (props: {
  children?: any;
  imageUrl?: string;
  handleClose?: any;
  config?: AgentInterfaceConfig;
}) => {
  return (
    <Stack
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
          zIndex: 1,
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
          {/* {config??.displayName && ( */}
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

function ChatBubble({ ...props }: BubbleProps) {
  const config =
    (props.interfaceConfig as AgentInterfaceConfig) || defaultChatBubbleConfig;
  const agentIconUrl =
    props?.interfaceConfig?.iconUrl ||
    props?.agentIconUrl ||
    `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/images/chatbubble-default-icon-sm.gif`;

  const initMessageRef = useRef(null);

  const [state, setState] = useStateReducer({
    isOpen: !!props.isOpen,
    hasOpenOnce: false,
    showInitialMessage: false,
    visitorEmail: '',
    showLeadFormAfterMessageId: '',
  });

  useEffect(() => {
    setState({ isOpen: !!props.isOpen });
  }, [props.isOpen]);

  const initMessages = useMemo(() => {
    let msgs = config.initialMessages || ([] as string[]);
    return msgs.map((each) => each?.trim?.()).filter((each) => !!each);
  }, [config?.initialMessages]);

  useEffect(() => {
    let t: NodeJS.Timeout | null = null;

    if (initMessages?.length > 0 && !config?.isInitMessagePopupDisabled) {
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
  }, [initMessages?.length, config?.isInitMessagePopupDisabled]);

  const handleClose = useCallback(() => {
    setState({ isOpen: false });
  }, []);

  const bubbleIcon = useMemo(() => {
    return (
      <Avatar
        src={agentIconUrl}
        sx={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          ...config?.bubbleIconStyle,
        }}
      />
    );
  }, [agentIconUrl, config?.bubbleIconStyle]);

  const Layout = React.useMemo(() => {
    return (props: any) => (
      <ChatBoxLayout
        {...props}
        handleClose={handleClose}
        imageUrl={agentIconUrl}
      />
    );
  }, []);

  if (props?.isLoadingAgent) {
    return null;
  }

  return (
    <>
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

              zIndex: zIndex - 1,

              ...(config?.position === 'left'
                ? {
                    left: '20px',
                  }
                : {}),
              ...(config?.position === 'right'
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

                ...(config?.position === 'left'
                  ? {
                      right: 0,
                    }
                  : {}),
                ...(config?.position === 'right'
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
              <CloseIcon sx={{ fontSize: 'sm' }} />
            </IconButton>

            <AnimateMessagesOneByOne
              messages={initMessages.map((each) => ({
                iconUrl: agentIconUrl,
                from: 'agent',
                message: each,
                approvals: [],
              }))}
            />
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
          zIndex,

          ...(config?.position === 'left'
            ? {
                left: '20px',
              }
            : {}),
          ...(config?.position === 'right'
            ? {
                right: '20px',
              }
            : {}),
        }}
      >
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
              ref={ref as any}
              variant="outlined"
              sx={(theme) => ({
                pointerEvents: state.isOpen ? 'all' : 'none',
                position: 'absolute',
                bottom: '80px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                // background: 'white',
                p: 0,
                gap: 0,

                opacity: 1,
                zIndex: 1,

                ...(config?.position === 'right'
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
                },
              })}
            >
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

                  // '& .message-agent': {},
                  // '& .message-human': {
                  //   backgroundColor: config?.primaryColor,
                  // },
                  // '& .message-human *': {
                  //   color: textColor,
                  // },

                  overflowY: 'hidden',
                })}
              >
                <Base
                  {...props}
                  chatBoxProps={{ ...props.chatBoxProps, isOpen: state.isOpen }}
                  agentIconUrl={agentIconUrl}
                  layout={Layout}
                />
                {/* <ChatBoxLoader
                  agentId={props.agentId}
                  initConfig={config?}
                  contact={props.contact}
                  context={props.context}
                  layout={Layout}
                /> */}
              </Stack>
            </Card>
          )}
        </Motion>

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
                backgroundColor: config?.primaryColor,
                width: '60px',
                height: '60px',
                borderRadius: '100%',
                // color: textColor,
                // transition: 'all 100ms ease-in-out',
                borderWidth: '0.5px',
                borderColor: theme.palette.divider,
                borderStyle: 'solid',
                p: '0',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: config?.primaryColor,
                  filter: 'brightness(0.9)',
                  transform: 'scale(1.05)',
                },
                ...config?.bubbleButtonStyle,
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

                {!state.isOpen && bubbleIcon}
              </AnimatePresence>
            </IconButton>
          )}
        </Motion>
      </Box>
    </>
  );
}

export default ChatBubble;
