import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { Button, ColorPaletteProp } from '@mui/joy';
import Stack from '@mui/joy/Stack';
import React, { useContext } from 'react';
import { useFrame } from 'react-frame-component';
import { useTranslation } from 'react-i18next';

import { ChatContext } from '@app/hooks/useChat';
import useStateReducer from '@app/hooks/useStateReducer';

import i18n from '@chaindesk/lib/locales/i18next';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import type { ConversationStatus } from '@chaindesk/prisma';

// import { InjectLeadForm, LEAD_FORM_ID } from './LeadForm';
import ResolveButton, { updateConversationStatus } from './ResolveButton';

type Props = { config: AgentInterfaceConfig };

function CustomerSupportActions({ config }: Props) {
  const {
    conversationId,
    conversationStatus,
    visitorEmail,
    history,
    setHistory,
    createNewConversation,
    refreshConversation,
  } = useContext(ChatContext);
  const { t } = useTranslation();
  const { document } = useFrame();

  const [state, setState] = useStateReducer({
    showResolveButton: false,
    showCaptureForm: false,
    isCaptureLoading: false,
    isHumanRequestLoading: false,
    showHelp: false,
    emailInputValue: '',
  });

  if (!conversationId || !conversationStatus) {
    return null;
  }

  return (
    <>
      {/* {!config.isLeadCaptureDisabled && <InjectLeadForm />} */}

      <Stack
        direction="row"
        sx={{
          // position: 'relative',
          alignItems: 'center',
          justifyContent: 'start',
        }}
      >
        {!config.isMarkAsResolvedDisabled && (
          <ResolveButton
            conversationId={conversationId!}
            conversationStatus={conversationStatus!}
            refreshConversation={refreshConversation}
            createNewConversation={() => {
              createNewConversation?.();
            }}
          />
        )}

        {!config.isHumanRequestedDisabled && (
          <Button
            size="sm"
            variant={'plain'}
            disabled={conversationStatus === 'HUMAN_REQUESTED'}
            loading={state.isHumanRequestLoading}
            sx={{
              whiteSpace: 'nowrap',
            }}
            color="neutral"
            // color={
            //   (
            //     {
            //       ['HUMAN_REQUESTED']: 'warning',
            //       ['RESOLVED']: 'neutral',
            //       ['UNRESOLVED']: 'neutral',
            //     } as Record<ConversationStatus, ColorPaletteProp>
            //   )[conversationStatus]
            // }
            startDecorator={
              <AccountCircleRoundedIcon
                color={
                  conversationStatus === 'HUMAN_REQUESTED'
                    ? 'warning'
                    : 'neutral'
                }
              />
            }
            onClick={async () => {
              try {
                setState({
                  isHumanRequestLoading: true,
                });
                if (!visitorEmail) {
                  // const input = document?.getElementById(LEAD_FORM_ID);
                  // input?.focus();
                } else {
                  await updateConversationStatus(
                    conversationId,
                    'HUMAN_REQUESTED'
                  );

                  await refreshConversation();
                }
              } catch {
              } finally {
                setState({
                  isHumanRequestLoading: false,
                });

                // const id = 'human-requested';

                // setHistory?.([
                //   ...history,
                //   {
                //     id,
                //     from: 'agent',
                //     message: 'Operator requested',
                //     disableActions: true,
                //   },
                // ] as ChatMessage[]);
              }
            }}
          >
            {
              (
                {
                  ['HUMAN_REQUESTED']: 'Human Requested',
                  ['RESOLVED']: `${t('chatbubble:actions.request')}`,
                  ['UNRESOLVED']: `${t('chatbubble:actions.request')}`,
                } as Record<ConversationStatus, string>
              )[conversationStatus]
            }
          </Button>
        )}
      </Stack>
    </>
  );
}

export default CustomerSupportActions;
