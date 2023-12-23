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
import BlablaFormViewer, {
  LOCAL_STORAGE_CONVERSATION_KEY,
} from '@app/components/BlablaFormViewer';
import FormSubmissionsTab from '@app/components/FormSubmissionsTab';
import Input from '@app/components/Input';
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
import {
  CreateFormSchema,
  FormConfigSchema,
  FormFieldSchema,
} from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma } from '@chaindesk/prisma';

import { isEmpty } from '..';

interface FormDashboardProps {}

function FormDashboard(props: FormDashboardProps) {
  const [state, setState] = useStateReducer({
    currentAnswer: '',
    isConversationStarted: false,
    isFormCompleted: false,
    isPublishable: false,
  });

  const router = useRouter();

  const formId = useMemo(
    () => router.query.formId,
    [router.query.formId]
  ) as string;

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

  const methods = useForm<FormConfigSchema>({
    resolver: zodResolver(FormConfigSchema),
    defaultValues: {},
    mode: 'onChange',
  });

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
    name: 'fields',
  });

  const chatData = useChat({
    endpoint: `/api/forms/${formId}/chat?draft=true`,
    localStorageConversationIdKey: LOCAL_STORAGE_CONVERSATION_KEY,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CONVERSATION_KEY, '');
    }
  }, []);

  useEffect(() => {
    methods.reset({
      ...(getFormQuery.data?.draftConfig as any),
    });
  }, [getFormQuery.data]);

  useEffect(() => {
    if (router.isReady && typeof window !== 'undefined' && !router.query.tab) {
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

  const onSubmit = React.useCallback(
    debounce(async (values: FormConfigSchema) => {
      toast.promise(
        updateFormMutation.trigger({
          draftConfig: values,
        } as any),
        {
          loading: 'Saving...',
          success: 'Saved',
          error: 'Something went wrong',
        },
        {
          position: 'bottom-right',
        }
      );
    }, 1000),
    []
  );

  const { watch, formState, handleSubmit } = methods;

  useEffect(() => {
    const subscription = watch(() => {
      if (formState.isDirty) {
        handleSubmit(onSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [formState.isDirty, handleSubmit, onSubmit]);

  const values = watch();
  const currentFieldName =
    chatData?.history?.[chatData.history.length - 1]?.metadata?.currentField;

  const currentField = useMemo(() => {
    return values?.fields?.find((field) => field.name === currentFieldName);
  }, [currentFieldName, values?.fields]);

  const Choices = useMemo(() => {
    const Component = (props: { name: 'fields.0.choices' }) => {
      const { fields, append, remove } = useFieldArray({
        control,
        name: props.name,
      });

      useEffect(() => {
        if (fields.length === 0) {
          append('');
        }
      }, [fields.length]);

      return (
        <Stack gap={1}>
          <Stack gap={1}>
            {fields?.map((field, i) => (
              <Stack key={`${field.id}`} direction="row" gap={1}>
                <Input
                  size="sm"
                  control={methods.control}
                  endDecorator={
                    <IconButton
                      onClick={() => remove(i)}
                      disabled={fields.length <= 1}
                    >
                      <CloseIcon fontSize="sm" />
                    </IconButton>
                  }
                  {...register(`${props.name}.${i}`)}
                />
              </Stack>
            ))}
          </Stack>

          <Button
            size="sm"
            onClick={() => append('')}
            variant="plain"
            sx={{ ml: 'auto' }}
            startDecorator={<AddCircleRoundedIcon fontSize="sm" />}
          >
            Add Choice
          </Button>
        </Stack>
      );
    };
    return Component;
  }, []);

  console.log('currentFieldName', currentFieldName);
  console.log('currentField', currentField);
  console.log('ERRORS', methods.formState.errors);

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
          // defaultValue={'settings'}
          value={(router.query.tab as string) || 'settings'}
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
            <Tab indicatorInset value={'settings'}>
              Settings
            </Tab>
            <Tab indicatorInset value={'submissions'}>
              Submissions
            </Tab>
          </TabList>

          <TabPanel value={'preview'}>Preview</TabPanel>

          <TabPanel value={'settings'}>
            <FormProvider {...methods}>
              <Card
                component={'form'}
                onSubmit={methods.handleSubmit(onSubmit)}
              >
                <Stack direction="row" gap={3}>
                  {/* start */}
                  <Stack width="35%" gap={4}>
                    <Stack gap={1}>
                      <Typography level="title-md">Form Fields</Typography>
                      <Alert startDecorator={<InfoRoundedIcon />}>
                        {`Field names have an impact on context understanding for
                      the AI`}
                      </Alert>
                      <Stack gap={2}>
                        {fields?.map((field, index) => (
                          <Box
                            key={field.id}
                            display="flex"
                            alignItems="center"
                          >
                            <Stack
                              direction={'column'}
                              gap={1}
                              sx={{ width: '100%' }}
                            >
                              <Stack
                                sx={{ width: '100%' }}
                                direction="row"
                                gap={1}
                                alignItems={'start'}
                              >
                                <Controller
                                  name={`fields.${index}.type` as const}
                                  render={({
                                    field: {
                                      onChange,
                                      onBlur,
                                      value,
                                      name,
                                      ref,
                                    },
                                    fieldState: {
                                      invalid,
                                      isTouched,
                                      isDirty,
                                      error,
                                    },
                                    formState,
                                  }) => (
                                    <Select
                                      size="sm"
                                      value={value}
                                      onChange={(_, value) => {
                                        onChange(value);
                                      }}
                                      sx={{ minWidth: '80px' }}
                                    >
                                      <Option value="text">text</Option>
                                      <Option value="multiple_choice">
                                        mutliple choice
                                      </Option>
                                    </Select>
                                  )}
                                ></Controller>
                                <Input
                                  control={methods.control}
                                  sx={{ width: '100%' }}
                                  size="sm"
                                  key={field.id}
                                  defaultValue={field.name}
                                  placeholder="e.g. email"
                                  {...register(`fields.${index}.name` as const)}
                                  endDecorator={
                                    <IconButton onClick={() => remove(index)}>
                                      <CloseIcon fontSize="sm" />
                                    </IconButton>
                                  }
                                />

                                {/* {(getValues(`fields.${index}.choices`) || []).map(
                            (choice, i) => (
                              <Chip key={i}>{choice}</Chip>
                            )
                          )} */}
                              </Stack>

                              {values?.fields?.[index]?.type ===
                                'multiple_choice' && (
                                <Stack sx={{ px: 2 }}>
                                  <Choices
                                    name={`fields.${index}.choices` as any}
                                  />
                                </Stack>
                              )}
                            </Stack>
                            {/* <Checkbox
                        defaultChecked={true}
                        size="sm"
                        {...register(
                          `fields.${index}.required` as const
                        )}
                      /> */}
                          </Box>
                        ))}
                        <Button
                          size="sm"
                          startDecorator={
                            <AddCircleRoundedIcon fontSize="sm" />
                          }
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            append({
                              name: '',
                              id: cuid(),
                              required: true,
                              type: 'text',
                            });
                            trigger();
                          }}
                        >
                          Add Field
                        </Button>
                        {/* {getFormQuery.data && (
                          <AutoSaveForm
                            onSubmit={saveFields}
                            defaultValues={{}}
                            validFormAction={() =>
                              setState({ isPublishable: true })
                            }
                          />
                        )} */}
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack gap={2}>
                      <Typography level="title-md">Welcome Screen</Typography>
                      <FormControl>
                        <FormLabel>Intoduce the form.</FormLabel>
                        <Textarea
                          minRows={2}
                          maxRows={4}
                          {...register('introScreen.introText')}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Call to action</FormLabel>
                        <Input
                          control={methods.control}
                          {...register('introScreen.ctaText')}
                        />
                      </FormControl>
                    </Stack>

                    <Divider />

                    <FormControl>
                      <FormLabel>Webhook</FormLabel>
                      <Input
                        control={methods.control}
                        placeholder="https://example.com/api/webhook"
                        {...register('webhook.url')}
                      />
                      <FormHelperText>
                        Send form submission to the provided endpoint with a
                        HTTP POST request
                      </FormHelperText>
                    </FormControl>
                  </Stack>

                  <Stack sx={{ width: '100%' }} gap={1}>
                    <Button
                      variant="solid"
                      color="primary"
                      // disabled={!state.isPublishable}
                      startDecorator={<RocketLaunch />}
                      onClick={handlePublish}
                      sx={{ ml: 'auto' }}
                    >
                      Publish Form
                    </Button>
                    {/* {
                    (!isEmpty(getFormQuery.data?.publishedConfig) ||
                      !isEmpty(getFormQuery.data?.draftConfig)) && (
                      <Button
                        variant="solid"
                        color="primary"
                        disabled={!state.isPublishable}
                        startDecorator={<RocketLaunch />}
                        onClick={handlePublish}
                        sx={{ ml: 'auto' }}
                      >
                        Publish Form
                      </Button>
                    )} */}

                    <Stack
                      sx={(t) => ({
                        border: '1px solid',
                        borderRadius: t.radius.md,
                        borderColor: t.palette.divider,
                        width: '100%',
                        height: '100%',
                      })}
                    >
                      <BlablaFormViewer
                        formId={formId}
                        config={{
                          fields: values?.fields,
                          introScreen: values?.introScreen,
                          webhook: values?.webhook,
                          schema: (getFormQuery.data?.draftConfig as any)
                            ?.schema,
                        }}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </FormProvider>
          </TabPanel>

          <TabPanel value="submissions">
            {formId && <FormSubmissionsTab formId={formId} />}
          </TabPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default FormDashboard;

FormDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {
//         product: getProductFromHostname(ctx?.req?.headers?.host),
//       },
//     };
//   }
// );
