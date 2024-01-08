import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddAPhoto,
  AutoAwesomeMosaicOutlined,
  RocketLaunch,
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Stack,
  styled,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Typography,
} from '@mui/joy';
import Chip from '@mui/joy/Chip';
import cuid from 'cuid';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import debounce from 'p-debounce';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import z from 'zod';

import FormSubmissionsTab from '@app/components/FormSubmissionsTab';
import Layout from '@app/components/Layout';
import useChat from '@app/hooks/useChat';
import useConfetti from '@app/hooks/useConfetti';
import { getProductFromHostname } from '@app/hooks/useProduct';
import useStateReducer from '@app/hooks/useStateReducer';
import { getForm } from '@app/pages/api/forms/[formId]';
import { updateForm } from '@app/pages/api/forms/[formId]/admin';
import { publishForm } from '@app/pages/api/forms/[formId]/publish';

import slugify from '@chaindesk/lib/slugify';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import {
  CreateFormSchema,
  FormConfigSchema,
  FormFieldSchema,
} from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { ConversationChannel, Prisma } from '@chaindesk/prisma';

import Motion from './Motion';
import MotionBottom from './MotionBottom';

export const isEmpty = (obj: any) => Object?.keys(obj || {}).length === 0;

type Props = {
  formId: string;
  config?: FormConfigSchema;
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

function BlablaFormViewer({ formId, config }: Props) {
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
      (field) => slugify(field.name) === currentFieldName
    );
  }, [currentFieldName, config?.fields]);

  const initiateForm = () => {
    localStorage.setItem('conversationId', '');
    setState({ isConversationStarted: true });
    answerQuestion('👋');
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
      height="100%"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      textAlign={'center'}
      // component={motion.div}

      sx={{
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
        <Stack sx={{ maxWidth: 'md' }} gap={5}>
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
            state.isConversationStarted && (
              <Stack sx={{ width: '100%' }}>
                {currentField?.type !== 'multiple_choice' && (
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
                )}

                {currentField?.type === 'multiple_choice' && (
                  <Stack
                    gap={2}
                    sx={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}
                    direction="row"
                    component={motion.div}
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.35,
                        },
                      },
                    }}
                    initial="hidden"
                    animate="show"
                  >
                    {currentField?.choices?.map((choice, i) => (
                      <Motion
                        key={choice}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0 },
                        }}
                      >
                        {({ ref }) => (
                          <span ref={ref}>
                            <FormButton
                              variant="solid"
                              onClick={() => {
                                answerQuestion(choice);
                              }}
                              size="lg"
                            >
                              {choice}
                            </FormButton>
                          </span>
                        )}
                      </Motion>
                    ))}
                  </Stack>
                )}
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

          {!state.isConversationStarted && (
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

              {/* <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                  hidden: {
                    opacity: 0,
                    y: 100,
                  },
                }}
              >
                <FormButton variant="solid" onClick={initiateForm} size="lg">
                  {config?.startScreen?.cta?.label}
                </FormButton>
              </motion.div> */}

              <Motion
                initial="hidden"
                animate="visible"
                transition={{
                  delay: 0.2,
                  // type: 'spring',
                  // bounce: 1,
                  // stiffness: 50,
                  // damping: 300,
                }}
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    // scale: 1,
                    // transition: {
                    //   when: 'beforeChildren',
                    //   staggerChildren: 0.2,
                    // },
                  },
                  hidden: {
                    opacity: 0,
                    y: 20,
                    // scale: 0.5,
                    // transition: {
                    //   when: 'afterChildren',
                    // },
                  },
                }}
              >
                {({ ref }) => (
                  <span ref={ref}>
                    <FormButton
                      variant="solid"
                      onClick={initiateForm}
                      size="lg"
                    >
                      {config?.startScreen?.cta?.label}
                    </FormButton>
                  </span>
                )}
              </Motion>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}

export default BlablaFormViewer;
