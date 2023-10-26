import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddAPhoto,
  AutoAwesomeMosaicOutlined,
  RocketLaunch,
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  IconButton,
  Input,
  Option,
  Select,
  Stack,
  Tab,
  tabClasses,
  TabList,
  Tabs,
  Textarea,
  Typography,
} from '@mui/joy';
import Chip from '@mui/joy/Chip';
import cuid from 'cuid';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import z from 'zod';

import AutoSaveForm from '@app/components/AutoSaveForm';
import Layout from '@app/components/Layout';
import useChat from '@app/hooks/useChat';
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
import { CreateFormSchema } from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma } from '@chaindesk/prisma';

import { isEmpty } from '..';
interface FormDashboardProps {}

type Field = {
  id: string;
  fieldName: string;
  required: boolean;
  choices?: string[];
};

const DynamicFeildsResolver = z.object({
  dynamicFields: z.array(
    z.object({
      id: z.string(),
      fieldName: z.string().min(5, 'fieldame must be longer than 5 characters'),
      required: z.boolean(),
      choices: z.optional(z.array(z.string())),
    })
  ),
  introScreen: z
    .object({
      introText: z.string(),
      ctaText: z.string(),
    })
    .optional(),
});

function FormDashboard(props: FormDashboardProps) {
  const [state, setState] = useStateReducer({
    currentAnswer: '',
    isConversationStarted: false,
    isFormCompleted: false,
    isPublishable: false,
  });

  const router = useRouter();

  const formId = useMemo(() => router.query.formId, [router.query.formId]);
  const getFormQuery = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
    formId ? `/api/forms/${formId}` : null,
    fetcher
  );

  const updateFormMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateForm>
  >(`/api/forms/${formId}/admin`, generateActionFetcher(HTTP_METHOD.PATCH));

  const publishFormMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof publishForm>
  >(`/api/forms/${formId}/publish`, generateActionFetcher(HTTP_METHOD.POST));

  const methods = useForm<{
    dynamicFields: Field[];
    introScreen: { introText: string; ctaText: string };
  }>({
    resolver: zodResolver(DynamicFeildsResolver),
    defaultValues: {},
  });
  console.log(
    (getFormQuery.data?.publishedConfig as any)?.introScreen?.ctaText
  );
  const {
    control,
    register,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dynamicFields',
  });

  const chatData = useChat({
    endpoint: `/api/forms/${formId}/chat`,
  });

  useEffect(() => {
    // load data on first render
    if (fields.length === 0) {
      setValue(
        'introScreen',
        (getFormQuery.data?.draftConfig as any)?.introScreen
      );
      append(
        ((getFormQuery.data?.draftConfig as any)?.fields || []) as Field[]
      );
      localStorage.setItem('conversationId', '');
    }
  }, [getFormQuery.data]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab('settings');
    }
  }, [router.query.tab]);

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.replace(router);
  };

  const handlePublish = async () => {
    await toast.promise(publishFormMutation.trigger(), {
      loading: 'Publishing...',
      success: 'Published!',
      error: 'Something went wrong',
    });
    getFormQuery.mutate();
  };

  const answerQuestion = async (answer: string) => {
    await chatData.handleChatSubmit(answer);
  };

  const saveFields = async () => {
    console.log('-------------', getValues('introScreen'));
    await updateFormMutation.trigger({
      draftConfig: {
        fields: getValues('dynamicFields'),
        introScreen: getValues('introScreen'),
      },
    } as any);
  };

  const initiateForm = () => {
    localStorage.setItem('conversationId', '');
    setState({ isConversationStarted: true });
    answerQuestion(
      'I am ready, to fill the form. prompt me with informations you need.'
    );
  };

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        gap: 1,
      })}
    >
      <Stack direction={'row'} gap={2} alignItems={'center'}>
        <Tabs
          aria-label="tabs"
          value={(router.query.tab as string) || 'chat'}
          size="md"
          sx={{
            bgcolor: 'transparent',
            width: '100%',
          }}
          onChange={(_, value) => {
            handleChangeTab(value as string);
          }}
        >
          <TabList
            size="sm"
            sx={{
              [`&& .${tabClasses.root}`]: {
                flex: 'initial',
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'transparent',
                },
                [`&.${tabClasses.selected}`]: {
                  color: 'primary.plainColor',
                  '&::after': {
                    height: '3px',
                    borderTopLeftRadius: '3px',
                    borderTopRightRadius: '3px',
                    bgcolor: 'primary.500',
                  },
                },
              },
            }}
          >
            <Tab indicatorInset value={'preview'}>
              Preview
            </Tab>

            <Tab indicatorInset value={'settings'}>
              Settings
            </Tab>
          </TabList>
        </Tabs>
      </Stack>
      <Card>
        {router.query.tab === 'settings' && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              {(!isEmpty(getFormQuery.data?.publishedConfig) ||
                !isEmpty(getFormQuery.data?.draftConfig)) && (
                <Button
                  variant="outlined"
                  disabled={!state.isPublishable}
                  startDecorator={<RocketLaunch />}
                  onClick={handlePublish}
                >
                  Publish Form
                </Button>
              )}
            </Box>

            <Stack direction="row" gap={3}>
              {/* start */}
              <Stack width="35%">
                <Typography level="title-md">
                  Informations To Collect
                </Typography>
                <FormProvider {...methods}>
                  {fields?.map((field, index) => (
                    <Box
                      key={field.id}
                      display="flex"
                      alignItems="center"
                      marginBottom={2}
                    >
                      <Box sx={{ mx: 1, width: '100%' }}>
                        <Input
                          size="sm"
                          key={field.id}
                          defaultValue={field.fieldName}
                          {...register(
                            `dynamicFields.${index}.fieldName` as const
                          )}
                          endDecorator={
                            <IconButton onClick={() => remove(index)}>
                              <CloseIcon fontSize="sm" />
                            </IconButton>
                          }
                        />

                        {(
                          getValues(`dynamicFields.${index}.choices`) || []
                        ).map((choice, i) => (
                          <Chip key={i}>{choice}</Chip>
                        ))}
                      </Box>
                      <Checkbox
                        size="sm"
                        {...register(
                          `dynamicFields.${index}.required` as const
                        )}
                      />
                    </Box>
                  ))}
                  <Typography
                    level="body-sm"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      width: '140px',
                    }}
                    startDecorator={<AddIcon fontSize="sm" />}
                    onClick={() => {
                      append({
                        fieldName: '',
                        id: cuid(),
                        required: false,
                      });
                      trigger();
                    }}
                  >
                    Add another field
                  </Typography>
                  <AutoSaveForm
                    onSubmit={saveFields}
                    defaultValues={{}}
                    validFormAction={() => setState({ isPublishable: true })}
                  />
                </FormProvider>

                <Stack spacing={0.6} mt={2}>
                  <Typography level="title-md">Welcome Screen</Typography>
                  <Box>
                    <Typography level="body-sm">Intoduce the form.</Typography>
                    <Textarea
                      sx={{ height: '100px', overflowY: 'auto' }}
                      {...register('introScreen.introText')}
                    />
                  </Box>
                  <Box>
                    <Typography level="body-sm">Call to action</Typography>
                    <Input {...register('introScreen.ctaText')} />
                  </Box>
                </Stack>
              </Stack>

              <Box
                height="100%"
                minHeight="80vh"
                width="100%"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ border: '1px solid gray ', borderRadius: '9px' }}
              >
                {isEmpty(getFormQuery.data?.publishedConfig) ? (
                  <Typography>You need to publish your form first</Typography>
                ) : (
                  <Box>
                    <Box
                      width="100%"
                      display="flex"
                      sx={{ textAlign: 'center' }}
                    >
                      {chatData.history.length > 0 &&
                        chatData?.history[chatData.history.length - 1].from ===
                          'agent' && (
                          <Typography>
                            {
                              chatData?.history[chatData.history.length - 1]
                                .message
                            }
                          </Typography>
                        )}
                      {chatData.isStreaming && (
                        <span className="inline-block w-0.5 h-4 bg-current animate-typewriterCursor"></span>
                      )}
                    </Box>
                    <Box
                      width="100%"
                      height="100%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      sx={{ textAlign: 'center', mt: '20px' }}
                    >
                      {!chatData.isStreaming &&
                        !chatData.isFomValid &&
                        state.isConversationStarted && (
                          <input
                            autoFocus
                            className="bg-transparent outline-none text-xl"
                            placeholder="Type your answer "
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                answerQuestion(state.currentAnswer);
                              }
                            }}
                            onChange={(e) =>
                              setState({ currentAnswer: e.target.value })
                            }
                          />
                        )}
                    </Box>

                    {!state.isConversationStarted && (
                      <Stack
                        spacing={2}
                        maxWidth="100%"
                        sx={{
                          textAlign: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          level="h4"
                          maxWidth="300px"
                          sx={{
                            wordWrap: 'break-word',
                            whiteSpace: 'normal',
                          }}
                        >
                          {
                            (getFormQuery.data?.publishedConfig as any)
                              ?.introScreen?.introText
                          }
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={initiateForm}
                          sx={{ width: '50%' }}
                        >
                          {
                            (getFormQuery.data?.publishedConfig as any)
                              ?.introScreen?.ctaText
                          }
                        </Button>
                      </Stack>
                    )}
                  </Box>
                )}
              </Box>
            </Stack>
          </>
        )}
      </Card>
    </Box>
  );
}

export default FormDashboard;

FormDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {
        product: getProductFromHostname(ctx?.req?.headers?.host),
      },
    };
  }
);
