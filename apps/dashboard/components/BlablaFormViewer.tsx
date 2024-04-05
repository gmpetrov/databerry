import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendIcon from '@mui/icons-material/Send';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Input,
  Option,
  Select,
  Stack,
  styled,
  Textarea,
  Typography,
} from '@mui/joy';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';

import useChat from '@app/hooks/useChat';
import useConfetti from '@app/hooks/useConfetti';
import useStateReducer from '@app/hooks/useStateReducer';
import { getForm } from '@app/pages/api/forms/[formId]';

import slugify from '@chaindesk/lib/slugify';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import {
  FormConfigSchema,
  FormFieldSchema,
  TextField,
} from '@chaindesk/lib/types/dtos';
import { ConversationChannel, Prisma } from '@chaindesk/prisma';
import PhoneNumberInput from '@chaindesk/ui/PhoneNumberInput';
import PoweredBy from '@chaindesk/ui/PoweredBy';
import TraditionalForm from '@chaindesk/ui/TraditionalForm';
import VisuallyHiddenInput from '@chaindesk/ui/VisuallyHiddenInput';

import { formType } from './BlablaFormEditor/FieldsInput';
import Motion from './Motion';
type Props = {
  formId: string;
  conversationId?: string;
  messageId?: string;
  config?: FormConfigSchema;
  type: 'conversational' | 'traditional';
};

const FormButton = styled(Button)(({ theme }) => ({
  borderRadius: '100px',
  fontSize: '2rem',
  fontWeight: '400',
  transition: 'transform 0.1s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05) !important',
  },
}));

const FormText = styled(Typography)(({ theme }) => ({
  wordWrap: 'break-word',
  whiteSpace: 'normal',
  textAlign: 'left',
  transition: 'all 1s ease-in-out',
  fontWeight: '600',
}));

export const LOCAL_STORAGE_CONVERSATION_KEY = 'formConversationId';

function BlablaFormViewer({
  formId,
  conversationId,
  messageId,
  config,
  type,
}: Props) {
  const triggerConfetti = useConfetti();

  const [state, setState] = useStateReducer({
    currentAnswer: '',
    isConversationStarted: false,
  });

  const chatData = useChat({
    endpoint: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/forms/${formId}/chat?draft=true`,
    localStorageConversationIdKey: `${LOCAL_STORAGE_CONVERSATION_KEY}-${formId}`,
    channel: ConversationChannel.form,
  });

  const answerQuestion = async (answer: string) => {
    await chatData.handleChatSubmit(answer);
  };

  const currentFieldName =
    chatData?.history?.[chatData.history.length - 1]?.metadata?.currentField;

  const currentField = useMemo(() => {
    return config?.fields?.find(
      (field) => slugify(field?.name ?? '') === currentFieldName
    );
  }, [currentFieldName, config?.fields]);

  const initiateForm = () => {
    localStorage.setItem('conversationId', '');
    setState({ isConversationStarted: true });
    if (type === formType.conversational) {
      answerQuestion('👋');
    }
  };

  const lastMessage = chatData?.history[chatData.history.length - 1];
  const isFormValid = lastMessage?.metadata?.isValid;
  const lastMessageText = useMemo(() => {
    return lastMessage?.message?.replace?.(/__BLABLA.*/, '') || '';
  }, [lastMessage?.message]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CONVERSATION_KEY, '');
    }
  }, []);

  useEffect(() => {
    if (isFormValid) {
      triggerConfetti();
    }
  }, [isFormValid]);

  return (
    <Stack
      // component={motion.div}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        p: 4,
        '*': {
          // fontFamily: 'Bricolage Grotesque',
          fontFamily: 'Lato',
        },
      }}
    >
      {!config ? (
        <>
          <CircularProgress size="sm" color="neutral" />
        </>
      ) : (
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
          }}
          gap={5}
        >
          {type === formType.traditional && (
            <Stack
              sx={{ width: '100%', maxWidth: '350px', mx: 'auto', my: 'auto' }}
            >
              <TraditionalForm
                formId={formId}
                conversationId={conversationId}
                messageId={messageId}
                config={config}
              />
            </Stack>
          )}

          {type === formType.conversational && (
            <>
              <Stack
                width="100%"
                display="flex"
                alignItems={'start'}
                direction="row"
                gap={2}
              >
                {chatData.isStreaming && (
                  // <CircularProgress
                  //   sx={{
                  //     '--_root-size': '9px',
                  //     mb: 2,
                  //   }}
                  //   color="neutral"
                  //   size="sm"
                  // />
                  <span className="relative flex w-8 h-8 mt-[0px]">
                    <span className="absolute inline-flex w-full h-full bg-gray-400 rounded-full opacity-75 animate-ping"></span>
                    <span className="relative inline-flex w-8 h-8 bg-gray-500 rounded-full"></span>
                  </span>
                )}

                <Motion
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                >
                  {({ ref }) =>
                    chatData.history.length > 0 &&
                    lastMessage.from === 'agent' && (
                      <span ref={ref}>
                        <FormText
                          level="h1"
                          sx={{
                            fontSize: '1.8rem',
                            opacity: chatData.isStreaming ? 1 : 0.7,
                          }}
                        >
                          {lastMessageText}

                          {chatData.isStreaming && (
                            <span
                              className="bg-current animate-typewriterCursor"
                              style={{
                                //   height: '100%',
                                width: 3,
                                display: 'inline-block',
                                // backgroundColor: style?.color || 'black',
                                marginLeft: 4,
                                marginTop: -4,
                                verticalAlign: 'middle',
                                // opacity: Number(animatedText.cursorShown),
                                // ...cursorStyle,
                              }}
                            >
                              {/* trick to fix cursor height */}
                              <span style={{ visibility: 'hidden' }}>l</span>
                            </span>
                          )}
                        </FormText>
                      </span>
                    )
                  }
                </Motion>
              </Stack>

              {!chatData.isStreaming &&
                !isFormValid &&
                state.isConversationStarted &&
                type === formType.conversational && (
                  <Stack sx={{ width: '100%' }}>
                    <Input
                      autoFocus
                      className="w-full p-0 text-4xl font-semibold text-left bg-transparent border-none shadow-none outline-none before:shadow-none"
                      placeholder="Type your answer"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          answerQuestion(state.currentAnswer);
                        }
                      }}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        setState({
                          currentAnswer: e.target.value,
                        });
                      }}
                    />
                  </Stack>
                )}

              {isFormValid && config?.endScreen?.cta?.label && (
                <Motion
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                    },
                    hidden: {
                      opacity: 0,
                      y: 20,
                    },
                  }}
                >
                  {({ ref }) => (
                    <span ref={ref}>
                      <a
                        href={config?.endScreen?.cta?.url || '#'}
                        target={config?.endScreen?.cta?.target || '_blank'}
                      >
                        <FormButton variant="solid" size="lg">
                          {config?.endScreen?.cta?.label}
                        </FormButton>
                      </a>
                    </span>
                  )}
                </Motion>
              )}

              {!state.isConversationStarted && type === 'conversational' && (
                <Stack
                  gap={3}
                  maxWidth="100%"
                  sx={{
                    textAlign: 'center',
                    alignItems: 'center',
                  }}
                >
                  {config?.startScreen?.title && (
                    <Motion
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      {({ ref }) => (
                        <span ref={ref}>
                          <FormText // maxWidth="600px"
                            level="h1"
                            sx={{
                              textAlign: 'center',
                              fontWeight: 900,
                              fontSize: '4rem',
                            }}
                          >
                            {config?.startScreen?.title}
                          </FormText>
                        </span>
                      )}
                    </Motion>
                  )}
                  {config?.startScreen?.description && (
                    <Motion
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      {({ ref }) => (
                        <span ref={ref}>
                          <FormText // maxWidth="600px"
                            level="h1"
                            sx={{
                              textAlign: 'center',
                              fontWeight: 400,
                            }}
                          >
                            {config?.startScreen?.description}
                          </FormText>
                        </span>
                      )}
                    </Motion>
                  )}
                </Stack>
              )}
            </>
          )}
        </Stack>
      )}

      {type === formType.conversational && (
        <Stack sx={{ position: 'fixed', bottom: 15 }}>
          <PoweredBy />
        </Stack>
      )}
    </Stack>
  );
}

export default BlablaFormViewer;
