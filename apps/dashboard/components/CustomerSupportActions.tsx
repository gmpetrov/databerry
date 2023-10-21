import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ThreePRoundedIcon from '@mui/icons-material/ThreePRounded';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import React from 'react';

import useStateReducer from '@app/hooks/useStateReducer';

import type { ConversationStatus } from '@chaindesk/prisma';

import { API_URL } from './ChatBubble';
import ResolveButton from './ResolveButton';

type Props = {
  agentId: string;
  visitorId: string;
  conversationId: string;
  conversationStatus: ConversationStatus;
  handleCreateNewConversation: any;
  helpRequested?: boolean;
};

function CustomerSupportActions({
  agentId,
  visitorId,
  conversationId,
  conversationStatus,
  handleCreateNewConversation,
}: Props) {
  const [state, setState] = useStateReducer({
    showResolveButton: false,
    showCaptureForm: false,
    isCaptureLoading: false,
    showHelp: false,
    visitorEmail: '',
    emailInputValue: '',
  });

  React.useEffect(() => {
    if (localStorage) {
      try {
        const visitorEmail = localStorage.getItem('visitorEmail');

        if (visitorEmail) {
          setState({
            visitorEmail,
          });
        }
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    if (conversationId) {
      setState({
        showHelp: true,
        showResolveButton: true,
      });
    }
  }, [conversationId]);

  const handleSubmitCaptureForm = async (email: string) => {
    if (email) {
      setState({ isCaptureLoading: true });

      await fetch(`${API_URL}/api/agents/${agentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorEmail: email,
          conversationId,
          visitorId,
        }),
      });

      setState({
        isCaptureLoading: false,
        visitorEmail: email,
      });

      try {
        localStorage.setItem('visitorEmail', email);
      } catch {}
    }
  };

  return (
    <Stack
      direction="row"
      sx={{
        // position: 'relative',
        alignItems: 'center',
        justifyContent: 'start',
      }}
    >
      {state.showHelp && (
        <Stack
          sx={{
            width: '100%',
          }}
        >
          {state.visitorEmail && (
            <Chip
              size="sm"
              color="success"
              variant="soft"
              sx={{ mr: 'auto' }}
              endDecorator={<CheckRoundedIcon />}
            >
              help requested
            </Chip>
          )}

          {!state.visitorEmail && !state.showCaptureForm && (
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              startDecorator={<ThreePRoundedIcon />}
              sx={{ mr: 'auto' }}
              onClick={() => setState({ showCaptureForm: true })}
            >
              Help
            </Button>
          )}

          {!state.visitorEmail && state.showCaptureForm && (
            <div>
              <Stack
                direction="row"
                gap={0.5}
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  backgroundColor: 'white',
                  zIndex: 99,
                  top: 0,
                  left: 0,
                }}
                // direction="row"
                // gap={0.5}
                // sx={{ width: '100%' }}
              >
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => {
                    setState({
                      showCaptureForm: false,
                    });
                  }}
                >
                  <ArrowBackRoundedIcon />
                </IconButton>

                <Input
                  sx={{ width: '100%' }}
                  size="sm"
                  name="email"
                  type="email"
                  placeholder="Leave your email to get contacted by the team"
                  required
                  // startDecorator={<AlternateEmailRoundedIcon />}
                  onChange={(e) =>
                    setState({ emailInputValue: e.target.value })
                  }
                  disabled={state.isCaptureLoading}
                  endDecorator={
                    <IconButton
                      color="neutral"
                      type="button"
                      disabled={state.isCaptureLoading}
                      onClick={() => {
                        if (state.emailInputValue) {
                          handleSubmitCaptureForm(state.emailInputValue);
                        }
                      }}
                    >
                      {state.isCaptureLoading ? (
                        <CircularProgress size="sm" variant="soft" />
                      ) : (
                        <CheckRoundedIcon />
                      )}
                    </IconButton>
                  }
                ></Input>
              </Stack>
            </div>
          )}
        </Stack>
      )}

      {state.showResolveButton ? (
        <ResolveButton
          conversationId={conversationId}
          conversationStatus={conversationStatus}
          createNewConversation={() => {
            handleCreateNewConversation?.();

            // setConversationId('');

            setState({
              showResolveButton: false,
              showHelp: false,
            });
          }}
        />
      ) : null}
    </Stack>
  );
}

export default CustomerSupportActions;
