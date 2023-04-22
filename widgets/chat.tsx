import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/material/Stack';
import { Agent } from '@prisma/client';
import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import ChatBox from '@app/components/ChatBox';

const theme = extendTheme({});

function App(props: { agentId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [agent, setAgent] = React.useState<Agent | undefined>();
  const [messages, setMessages] = React.useState(
    [] as { from: 'human' | 'agent'; message: string }[]
  );

  const handleFetchAgent = async () => {
    try {
      const res = await fetch(`/api/external/agents/${props.agentId}`);
      const data = await res.json();

      setAgent(data);

      console.log('data', data);
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

    setMessages(history as any);

    const result = await fetch(`/api/external/agents/${props.agentId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        query: message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await result.json();

    setMessages([
      ...history,
      { from: 'agent', message: data?.answer as string },
    ] as any);
  };

  useEffect(() => {
    handleFetchAgent();
  }, []);

  return (
    <Box
      sx={{
        // bgcolor: 'red',
        overflow: 'visible',
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        // width: '60px',
        height: '60px',

        // borderRadius: '100%',
      }}
    >
      {isOpen && (
        <Box
          sx={(theme) => ({
            zIndex: 9999,
            position: 'absolute',
            bottom: '80px',
            display: 'block',

            [theme.breakpoints.down('sm')]: {
              bottom: '-20px',
              left: '-20px',
            },
          })}
        >
          <Card
            variant="outlined"
            sx={(theme) => ({
              width: '400px',
              // height: '680px',
              overflow: 'hidden',
              [theme.breakpoints.down('sm')]: {
                width: '100vw',
                height: '90vh',
              },
            })}
          >
            <Box sx={{ width: '100%', mt: -2, py: 1 }}>
              <Stack direction="row">
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
                width: '100%',
                height: '680px',
                maxHeight: '100%',
                position: 'relative',

                [theme.breakpoints.down('sm')]: {
                  height: '100%',
                },
              })}
            >
              <ChatBox messages={messages} onSubmit={handleChatSubmit} />
            </Box>
            {/* <a
              href="https://databerry.ai"
              target="_blank"
              style={{
                textDecoration: 'none',
                marginLeft: 'auto',
                //   marginTop: 2,
                //   marginBottom: 2,
              }}
            >
              <Box sx={{ py: 2 }}>
                <Typography level="body3">
                  Powered by{' '}
                  <Typography color="primary" fontWeight={'bold'}>
                    Databerry
                  </Typography>
                </Typography>
              </Box>
            </a> */}
          </Card>
        </Box>
      )}
      <IconButton
        color="primary"
        variant="solid"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          width: '60px',
          height: '60px',
          borderRadius: '100%',
          boxShadow: 2,
        }}
      >
        {isOpen ? <ClearRoundedIcon /> : <SmartToyRoundedIcon />}
      </IconButton>
    </Box>
  );
}

if (typeof window !== 'undefined') {
  addEventListener('DOMContentLoaded', (event) => {
    const me = document.querySelector('script[data-name="databerry-widget"]');
    console.log('CALLLED ------------->', me?.id);
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    root.render(
      <StrictMode>
        <CssVarsProvider theme={theme}>
          <App agentId={me?.id || 'clgqxreyd0000ya0u5hb560qs'} />
        </CssVarsProvider>
      </StrictMode>
    );
  });
}
