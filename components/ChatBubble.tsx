import {
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import colors from '@mui/joy/colors';
import CssBaseline from '@mui/joy/CssBaseline';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/material/Stack';
import { Agent } from '@prisma/client';
import React, { useEffect, useMemo } from 'react';

import ChatBox from '@app/components/ChatBox';
import { AgentInterfaceConfig } from '@app/types/models';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import pickColorBasedOnBgColor from '@app/utils/pick-color-based-on-bgcolor';

export const theme = extendTheme({
  cssVarPrefix: 'databerry-chat-bubble',
  colorSchemes: {
    dark: {
      palette: {
        primary: colors.grey,
      },
    },
    light: {
      palette: {
        primary: colors.grey,
      },
    },
  },
});

// const theme = extendTheme({
//   colorSchemes: {
//     dark: {
//       palette: {
//         primary: colors.grey,
//       },
//     },
//     light: {
//       palette: {
//         primary: colors.grey,
//       },
//     },
//   },
// });

const defaultChatBubbleConfig: AgentInterfaceConfig = {
  // displayName: 'Agent Smith',
  primaryColor: '#000000',
  // initialMessage: 'Hi, how can I help you?',
  // position: 'right',
  // messageTemplates: ["What's the pricing?"],
};

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

function App(props: { agentId: string; initConfig?: AgentInterfaceConfig }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [agent, setAgent] = React.useState<Agent | undefined>();
  const [config, setConfig] = React.useState<AgentInterfaceConfig>(
    props.initConfig || defaultChatBubbleConfig
  );
  const [messages, setMessages] = React.useState(
    [] as { from: 'human' | 'agent'; message: string }[]
  );

  const textColor = useMemo(() => {
    return pickColorBasedOnBgColor(
      config.primaryColor || '#ffffff',
      '#ffffff',
      '#000000'
    );
  }, [config.primaryColor]);

  const handleFetchAgent = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/external/agents/${props.agentId}`
      );
      const data = (await res.json()) as Agent;

      const agentConfig = data?.interfaceConfig as AgentInterfaceConfig;

      setAgent(data);
      setConfig({
        ...defaultChatBubbleConfig,
        ...agentConfig,
      });
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  const handleChatSubmit = async (message: string) => {
    if (!message) {
      return;
    }

    const history = [...messages, { from: 'human', message }];
    const nextIndex = history.length;

    setMessages(history as any);

    let answer = '';
    let error = '';

    try {
      const ctrl = new AbortController();
      let buffer = '';

      class RetriableError extends Error {}
      class FatalError extends Error {}

      await fetchEventSource(
        `${API_URL}/api/external/agents/${props.agentId}/query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            streaming: true,
            query: message,
          }),
          signal: ctrl.signal,

          async onopen(response) {
            if (
              response.ok &&
              response.headers.get('content-type') === EventStreamContentType
            ) {
              return; // everything's good
            } else if (
              response.status >= 400 &&
              response.status < 500 &&
              response.status !== 429
            ) {
              if (response.status === 402) {
                throw new ApiError(ApiErrorType.USAGE_LIMIT);
              }
              // client-side errors are usually non-retriable:
              throw new FatalError();
            } else {
              throw new RetriableError();
            }
          },
          onclose() {
            // if the server closes the connection unexpectedly, retry:
            throw new RetriableError();
          },
          onerror(err) {
            console.log('on error', err, Object.keys(err));
            if (err instanceof FatalError) {
              ctrl.abort();
              throw err; // rethrow to stop the operation
            } else if (err instanceof ApiError) {
              console.log('ApiError', ApiError);
              throw err;
            } else {
              // do nothing to automatically retry. You can also
              // return a specific retry interval here.
            }
          },

          onmessage: (event) => {
            if (event.data === '[DONE]') {
              ctrl.abort();
            } else if (event.data?.startsWith('[ERROR]')) {
              ctrl.abort();

              setMessages([
                ...history,
                {
                  from: 'agent',
                  message: event.data.replace('[ERROR]', ''),
                } as any,
              ]);
            } else {
              // const data = JSON.parse(event.data || `{}`);
              buffer += event.data as string;
              console.log(buffer);

              const h = [...history];

              if (h?.[nextIndex]) {
                h[nextIndex].message = `${buffer}`;
              } else {
                h.push({ from: 'agent', message: buffer });
              }

              setMessages(h as any);
            }
          },
        }
      );
    } catch (err) {
      console.log('err', err);
      if (err instanceof ApiError) {
        if (err?.message) {
          error = err?.message;

          if (error === ApiErrorType.USAGE_LIMIT) {
            answer =
              'Usage limit reached. Please upgrade your plan to get higher usage.';
          } else {
            answer = `Error: ${error}`;
          }
        } else {
          answer = `Error: ${error}`;
        }

        setMessages([
          ...messages,
          { from: 'agent', message: answer as string },
        ]);
      }
    }
  };

  useEffect(() => {
    handleFetchAgent();
  }, []);

  useEffect(() => {
    if (props.initConfig) {
      setConfig(props.initConfig);
    }
  }, [props.initConfig]);

  if (!agent) {
    return null;
  }

  return (
    <Box
      sx={{
        // bgcolor: 'red',
        overflow: 'visible',
        position: 'fixed',
        height: '60px',
        bottom: '20px',
        zIndex: 9999999999,

        ...(config.position === 'left'
          ? {
              left: '20px',
            }
          : {}),
        ...(config.position === 'right'
          ? {
              right: '20px',
            }
          : {}),
      }}
    >
      {isOpen && (
        <Card
          variant="outlined"
          sx={(theme) => ({
            zIndex: 9999,
            position: 'absolute',
            bottom: '80px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',

            ...(config.position === 'right'
              ? {
                  transform: `translateX(${-400 + 50}px)`,
                }
              : {}),

            width: '400px',
            [theme.breakpoints.down('sm')]: {
              width: '100vw',
              maxWidth: '100vw',

              bottom: '-20px',

              ...(config.position === 'left'
                ? {
                    left: '-20px',
                  }
                : {}),
              ...(config.position === 'right'
                ? {
                    transform: `translateX(0px)`,
                    right: '-20px',
                  }
                : {}),
            },
          })}
        >
          <Box sx={{ width: '100%', mt: -2, py: 1 }}>
            <Stack direction="row" alignItems={'center'}>
              {config?.displayName && (
                <Typography>{config?.displayName}</Typography>
              )}

              <IconButton
                variant="plain"
                sx={{ ml: 'auto' }}
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Box>
          <Divider />
          <Box
            sx={(theme) => ({
              // flex: 1,
              // display: 'flex',
              width: '100%',
              position: 'relative',

              height: 'calc(100vh - 200px)',
              maxHeight: '680px',

              [theme.breakpoints.down('sm')]: {
                height: '80vh',
                maxHeight: '80vh',
                maxWidth: '100vw',
              },

              '& .message-agent': {
                backgroundColor: config.primaryColor,
                borderColor: config.primaryColor,
                color: pickColorBasedOnBgColor(
                  config?.primaryColor! || '#ffffff',
                  '#ffffff',
                  '#000000'
                ),
              },
            })}
          >
            <ChatBox
              messages={messages}
              onSubmit={handleChatSubmit}
              messageTemplates={config.messageTemplates}
              initialMessage={config.initialMessage}
            />
          </Box>
          <a
            href="https://databerry.ai"
            target="_blank"
            style={{
              textDecoration: 'none',
              marginLeft: 'auto',
            }}
          >
            <Box sx={{ mt: 1 }}>
              <Typography level="body3">
                Powered by{' '}
                <Typography color="primary" fontWeight={'bold'}>
                  Databerry
                </Typography>
              </Typography>
            </Box>
          </a>
        </Card>
      )}
      <IconButton
        // color={'neutral'}
        variant="solid"
        onClick={() => setIsOpen(!isOpen)}
        sx={(theme) => ({
          backgroundColor: config.primaryColor,
          width: '60px',
          height: '60px',
          borderRadius: '100%',
          color: textColor,

          '&:hover': {
            backgroundColor: config.primaryColor,
            filter: 'brightness(0.9)',
          },
        })}
      >
        {isOpen ? <ClearRoundedIcon /> : <SmartToyRoundedIcon />}
      </IconButton>
    </Box>
  );
}

export default App;
