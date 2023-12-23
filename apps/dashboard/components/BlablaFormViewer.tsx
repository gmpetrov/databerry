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

import AutoSaveForm from '@app/components/AutoSaveForm';
import FormSubmissionsTab from '@app/components/FormSubmissionsTab';
import Input from '@app/components/Input';
import Layout from '@app/components/Layout';
import useChat from '@app/hooks/useChat';
import useConfetti from '@app/hooks/useConfetti';
import { getProductFromHostname } from '@app/hooks/useProduct';
import useStateReducer from '@app/hooks/useStateReducer';
import { getForm } from '@app/pages/api/forms/[formId]';
import { updateForm } from '@app/pages/api/forms/[formId]/admin';
import { publishForm } from '@app/pages/api/forms/[formId]/publish';

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
import { Prisma } from '@chaindesk/prisma';

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
  transition: 'all 0.15s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05) !important',
  },
}));

export const LOCAL_STORAGE_CONVERSATION_KEY = 'formConversationId';

function BlablaFormViewer({ formId, config }: Props) {
  const triggerConfetti = useConfetti();

  const [state, setState] = useStateReducer({
    currentAnswer: '',
    isConversationStarted: false,
  });

  const chatData = useChat({
    endpoint: `/api/forms/${formId}/chat?draft=true`,
    localStorageConversationIdKey: LOCAL_STORAGE_CONVERSATION_KEY,
  });

  const answerQuestion = async (answer: string) => {
    await chatData.handleChatSubmit(answer);
  };

  const currentFieldName =
    chatData?.history?.[chatData.history.length - 1]?.metadata?.currentField;

  const currentField = useMemo(() => {
    return config?.fields?.find((field) => field.name === currentFieldName);
  }, [currentFieldName, config?.fields]);

  const initiateForm = () => {
    localStorage.setItem('conversationId', '');
    setState({ isConversationStarted: true });
    answerQuestion(
      'I am ready, to fill the form. prompt me with informations you need.'
    );
  };

  const lastMessage = chatData?.history[chatData.history.length - 1];

  useEffect(() => {
    if (lastMessage?.metadata?.isValid) {
      triggerConfetti();
    }
  }, [lastMessage?.metadata?.isValid]);

  return (
    <Stack
      height="100%"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      textAlign={'center'}
      sx={{ p: 4 }}
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
              <span className="relative flex w-8 h-8">
                <span className="absolute inline-flex w-full h-full bg-gray-400 rounded-full opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-8 h-8 bg-gray-500 rounded-full"></span>
              </span>
            )}

            {chatData.history.length > 0 && lastMessage.from === 'agent' && (
              <Typography
                level="h1"
                // maxWidth="600px"
                sx={{
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  textAlign: 'left',
                  opacity: chatData.isStreaming ? 1 : 0.75,
                  transition: 'opacity 0.3s ease-in-out',
                }}
              >
                {lastMessage.message}

                {chatData.isStreaming && (
                  <span className="inline-block ml-1 w-0.5 h-4 bg-current animate-typewriterCursor"></span>
                )}
              </Typography>
            )}
          </Stack>

          {!chatData.isStreaming &&
            !chatData.isFomValid &&
            state.isConversationStarted && (
              <Stack sx={{ width: '100%' }}>
                {currentField?.type !== 'multiple_choice' && (
                  <input
                    autoFocus
                    className="w-full text-3xl text-left text-white bg-transparent outline-none"
                    placeholder="Type your answer "
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        answerQuestion(state.currentAnswer);
                      }
                    }}
                    onChange={(e) =>
                      setState({
                        currentAnswer: e.target.value,
                      })
                    }
                  />
                )}

                {currentField?.type === 'multiple_choice' && (
                  <Stack
                    gap={2}
                    sx={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}
                    direction="row"
                  >
                    {currentField?.choices?.map((choice, i) => (
                      <Motion
                        key={choice}
                        custom={i}
                        variants={{
                          visible: (i) => ({
                            opacity: 1,
                            transition: {
                              delay: i * 0.3,
                            },
                          }),
                          hidden: { opacity: 0 },
                        }}
                      >
                        {({ ref }) => (
                          <FormButton
                            ref={ref}
                            variant="solid"
                            onClick={() => {
                              answerQuestion(choice);
                            }}
                            size="lg"
                          >
                            {choice}
                          </FormButton>
                        )}
                      </Motion>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}

          {!state.isConversationStarted && (
            <Stack
              gap={5}
              maxWidth="100%"
              sx={{
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
              <MotionBottom
                transition={{
                  duration: 0.55,
                }}
              >
                {({ ref }) => (
                  <Typography
                    ref={ref as any}
                    level="h1"
                    // maxWidth="600px"
                    sx={{
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {config?.introScreen?.introText}
                  </Typography>
                )}
              </MotionBottom>

              <Motion
                initial="hidden"
                animate="visible"
                transition={{
                  delay: 0.5,
                  // type: 'spring',
                  // bounce: 1,
                  // stiffness: 50,
                  // damping: 300,
                }}
                variants={{
                  visible: {
                    opacity: 1,
                    // scale: 1,
                    // transition: {
                    //   when: 'beforeChildren',
                    //   staggerChildren: 0.2,
                    // },
                  },
                  hidden: {
                    opacity: 0,
                    // scale: 0.5,
                    // transition: {
                    //   when: 'afterChildren',
                    // },
                  },
                }}
              >
                {({ ref }) => (
                  <FormButton
                    ref={ref}
                    variant="solid"
                    onClick={initiateForm}
                    size="lg"
                  >
                    {config?.introScreen?.ctaText}
                  </FormButton>
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
