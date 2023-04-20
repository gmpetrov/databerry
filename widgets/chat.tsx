import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import { Box, Button, Card, IconButton, Sheet, Typography } from '@mui/joy';
import { CssVarsProvider } from '@mui/joy/styles';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ChatBox from '@app/components/ChatBox';

function Greeting({ name }: any) {
  return <h1>Hello, {name}</h1>;
}

function App() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Box
      sx={{
        // bgcolor: 'red',
        overflow: 'visible',
        position: 'fixed',
        bottom: '20px',
        // left: '20px',
        // width: '60px',
        height: '60px',

        // borderRadius: '100%',
      }}
    >
      {isOpen && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '80px',
            display: 'block',
            left: 0,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              width: '400px',
              height: '680px',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                position: 'relative',
              }}
            >
              <ChatBox
                messages={[
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                  {
                    from: 'agent',
                    message: 'Hello, how can I help you?',
                  },
                ]}
                onSubmit={async (message) => {
                  console.log('onSubmit', message);
                }}
              />
            </div>
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

addEventListener('DOMContentLoaded', (event) => {
  const me = document.querySelector('script[data-name="databerry-widget"]');
  console.log('CALLLED ------------->', me?.id);
  const div = document.createElement('div');
  document.body.appendChild(div);
  const root = createRoot(div);
  root.render(
    <StrictMode>
      <CssVarsProvider>
        <App />
      </CssVarsProvider>
    </StrictMode>
  );
});
