import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, CircularProgress, Input, Stack } from '@mui/joy';
import IconButton from '@mui/joy/IconButton';
import React, { useEffect } from 'react';

import useStateReducer from '@app/hooks/useStateReducer';
type CaptureProps = {
  agentId: string;
  visitorId: string;
  conversationId: string;
};

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

const Capture: React.FC<CaptureProps> = ({
  agentId,
  visitorId,
  conversationId,
}) => {
  const [state, setState] = useStateReducer({
    isCaptureLoading: false,
    emailCaptured: false,
    closed: false,
  });

  useEffect(() => {
    if (localStorage) {
      try {
        const visitorEmail = localStorage.getItem('visitorEmail');

        if (visitorEmail) {
          setState({
            emailCaptured: true,
          });
        }
      } catch {}
    }
  }, []);

  return !state.emailCaptured ? (
    <Alert
      sx={{
        background: 'rgba(255, 255, 255, 0.2)',
        boxShadow:
          '4px 2px 4px rgba(0, 0, 0, 0.1), -4px 2px 4px rgba(0, 0, 0, 0.1)',
        mx: '30px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <form
        style={{ width: '100%' }}
        onSubmit={async (e) => {
          setState({ isCaptureLoading: true });
          e.preventDefault();
          e.stopPropagation();

          const form = e.target as HTMLFormElement;
          const email = form.email.value;

          if (email) {
            try {
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
                emailCaptured: true,
              });
              localStorage.setItem('visitorEmail', email);
            } catch (e) {
              console.error(e);
            }
          }
        }}
      >
        <Stack direction="row" gap={0.5} sx={{ width: '100%' }}>
          <Input
            sx={{ width: '100%' }}
            size="sm"
            name="email"
            type="email"
            placeholder="Leave your email to request help from the team"
            required
            disabled={state.isCaptureLoading}
            endDecorator={
              <IconButton
                color="neutral"
                type="submit"
                disabled={state.isCaptureLoading}
              >
                {state.isCaptureLoading ? (
                  <CircularProgress size="sm" variant="soft" />
                ) : (
                  <ArrowForwardRoundedIcon />
                )}
              </IconButton>
            }
          />
        </Stack>
      </form>
    </Alert>
  ) : !state.closed ? (
    <Alert
      color="success"
      sx={{
        mx: '30px',
      }}
      endDecorator={
        <IconButton color="success" onClick={() => setState({ closed: true })}>
          <CloseIcon color="success" />
        </IconButton>
      }
    >
      Help requested on this conversation.
    </Alert>
  ) : null;
};
export default Capture;
