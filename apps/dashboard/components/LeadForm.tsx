import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/joy/CircularProgress';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { visit } from 'yaml/dist/parse/cst-visit';

import { ChatContext, ChatMessage } from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';

import i18n from '@chaindesk/lib/locales/i18next';

import { API_URL } from './ChatBubble';

export const LEAD_FORM_ID = 'lead-form';

export default function LeadForm(props: {
  agentId: string;
  conversationId: string;
  visitorId: string;
  visitorEmail?: string;
  onSubmitSucess?: (email: string) => any;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { t } = useTranslation('', { i18n });
  const [state, setState] = useStateReducer({
    isCaptureLoading: false,
    isCaptureSuccess: false,
    visitorEmail: props.visitorEmail || '',
    emailInputValue: '',
  });

  const handleSubmitCaptureForm = async (email: string) => {
    if (email) {
      setState({ isCaptureLoading: true });

      await fetch(`${API_URL}/api/agents/${props.agentId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitorEmail: email,
          conversationId: props.conversationId,
          visitorId: props.visitorId,
        }),
      });

      await props.onSubmitSucess?.(email);

      setState({
        isCaptureLoading: false,
        isCaptureSuccess: true,
      });
    }
  };

  return (
    <Stack
      direction="column"
      gap={1}
      sx={{
        width: '100%',
        height: '100%',
        pt: 1,
        pb: 2,
      }}
      // direction="row"
      // gap={0.5}
      // sx={{ width: '100%' }}
    >
      <Typography
        startDecorator={<ErrorIcon fontSize="md" />}
        level="body-sm"
        fontWeight={600}
      >
        {t('chatbubble:lead.instruction')}
      </Typography>
      <Input
        slotProps={{
          input: {
            id: LEAD_FORM_ID,
            ref,
          },
        }}
        sx={{ width: '100%' }}
        size="sm"
        name="email"
        type="email"
        placeholder={t('chatbubble:lead.email')}
        required
        // startDecorator={<AlternateEmailRoundedIcon />}
        onChange={(e) => setState({ emailInputValue: e.target.value })}
        disabled={
          state.isCaptureLoading ||
          !!props.visitorEmail ||
          state.isCaptureSuccess
        }
        autoFocus={false}
        defaultValue={props.visitorEmail}
        endDecorator={
          !state.visitorEmail && (
            <IconButton
              color="neutral"
              variant="solid"
              type="button"
              disabled={state.isCaptureLoading}
              onClick={() => {
                const isValid = ref.current?.checkValidity();
                if (!isValid) {
                  // return ref.current?.setCustomValidity('Invalid email');
                  return ref?.current?.reportValidity();
                }
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
          )
        }
      ></Input>

      <FormHelperText sx={{ fontSize: 'xs', fontStyle: 'italic' }}>
        {t('chatbubble:lead.required')}
      </FormHelperText>

      {/* <Button
          size="sm"
          type="button"
          color="neutral"
          variant="outline"
          loading={state.isCaptureLoading}
          onClick={() => {
            if (state.emailInputValue) {
              handleSubmitCaptureForm(state.emailInputValue);
            }
          }}
        >
          Submit
        </Button> */}
    </Stack>
  );
}

export function InjectLeadForm() {
  const {
    agentId,
    history,
    setHistory,
    visitorId,
    visitorEmail,
    conversationId,
    refreshConversation,
    isStreaming,
  } = useContext(ChatContext);

  const [state, setState] = useStateReducer({
    showLeadFormAfterMessageId: '',
  });

  useEffect(() => {
    /*
      Inject Lead Form after the last message on first load only to prevent spamming
      Do not show Lead Form if visitorEmail is already set or if there is no history
    */

    if (isStreaming) {
      return;
    }

    if (history?.length >= 2) {
      const foundIndex = history.findIndex((one) => one.id === LEAD_FORM_ID);

      if (!visitorEmail && foundIndex < 0) {
        let index = 0;
        // Keep track of the last message id to show Lead Form after
        let messageId = state.showLeadFormAfterMessageId;
        if (!messageId) {
          messageId = history[history.length - 1]?.id as string;
          setState({
            showLeadFormAfterMessageId: messageId,
          });
        }

        index = history.findIndex((one) => one.id === messageId);

        const _history = [...history];

        _history.splice(index + 1, 0, {
          id: LEAD_FORM_ID,
          from: 'agent',
          component: (
            <LeadForm
              agentId={agentId!}
              visitorId={visitorId}
              conversationId={conversationId}
              visitorEmail={visitorEmail}
              onSubmitSucess={async (email) => {
                refreshConversation();
              }}
            />
          ),
          disableActions: true,
        } as ChatMessage);

        setHistory(_history);
      } else if (visitorEmail && foundIndex >= 0) {
        const _history = [...history];
        _history.splice(foundIndex, 1);
        setHistory(_history);
      }
    }

    return;
  }, [
    state.showLeadFormAfterMessageId,
    history,
    visitorEmail,
    agentId,
    visitorId,
    conversationId,
    setHistory,
    refreshConversation,
    isStreaming,
  ]);

  return null;
}
