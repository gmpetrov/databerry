import { RocketLaunch } from '@mui/icons-material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Looks3RoundedIcon from '@mui/icons-material/Looks3Rounded';
import Looks4RoundedIcon from '@mui/icons-material/Looks4Rounded';
import LooksOneRoundedIcon from '@mui/icons-material/LooksOneRounded';
import LooksTwoRoundedIcon from '@mui/icons-material/LooksTwoRounded';
import {
  Accordion,
  AccordionDetails,
  accordionDetailsClasses,
  AccordionGroup,
  AccordionSummary,
  accordionSummaryClasses,
  Alert,
  Button,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Stack,
  Textarea,
  Typography,
  useColorScheme,
} from '@mui/joy';
import clsx from 'clsx';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';

import BlablaFormProvider from '@app/components/BlablaFormProvider';
import BlablaFormViewer from '@app/components/BlablaFormViewer';
import CopyButton from '@app/components/CopyButton';
import Input from '@app/components/Input';
import useBlablaForm from '@app/hooks/useBlablaForm';
import useStateReducer from '@app/hooks/useStateReducer';
import { publishForm } from '@app/pages/api/forms/[formId]/publish';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import { CreateFormSchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';

import Loader from '../Loader';

import FieldsInput from './FieldsInput';
import { forceSubmit } from './utils';

type Props = { formId: string };

function Form({ formId }: Props) {
  const { mode } = useColorScheme();
  const methods = useFormContext<CreateFormSchema>();
  const { query, mutation } = useBlablaForm({ id: formId });

  const [state, setState] = useStateReducer({
    currentAnswer: '',
    isConversationStarted: false,
    isFormCompleted: false,
    isPublishable: false,
    currentAccordionIndex: 0 as number | null,
  });

  const publishFormMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof publishForm>
  >(`/api/forms/${formId}/publish`, generateActionFetcher(HTTP_METHOD.POST));

  const draftConfig = methods.watch('draftConfig');

  const handlePublish = async () => {
    await toast.promise(
      publishFormMutation.trigger(),
      {
        loading: 'Publishing...',
        success: 'Published',
        error: 'Something went wrong',
      },
      {
        id: 'publish',
      }
    );
    query.mutate();
  };

  const formPublicUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL?.replace(
    'app.',
    ''
  )}/forms/${query?.data?.id}`;

  if (!query.data && query.isLoading) {
    return <Loader />;
  }

  return (
    <Card sx={{ height: '100%', p: 0 }}>
      <Stack
        direction="row"
        gap={3}
        sx={{ height: '100%' }}
        divider={<Divider orientation="vertical" />}
      >
        {/* start */}
        <Stack
          sx={{
            width: '35%',
            height: '100%',
            p: 2,
            pr: 0,
            position: 'relative',
          }}
        >
          <AccordionGroup
            disableDivider
            size="lg"
            transition="0.2s ease"
            // variant="outlined"
            sx={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              overflowY: 'auto',
              borderRadius: 'lg',
              [`& .${accordionSummaryClasses.button}:hover`]: {
                bgcolor: 'transparent',
              },
              [`& .${accordionDetailsClasses.content}`]: {
                boxShadow: (theme) =>
                  `inset 0 1px ${theme.vars.palette.divider}`,
                [`&.${accordionDetailsClasses.expanded}`]: {
                  paddingBlock: '0.75rem',
                },
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Accordion
              expanded={state.currentAccordionIndex === 0}
              onChange={(event, expanded) => {
                setState({
                  currentAccordionIndex: expanded ? 0 : null,
                });
              }}
            >
              <AccordionSummary>
                <Typography startDecorator={<LooksOneRoundedIcon />}>
                  Overview
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl>
                  <FormLabel>Overview</FormLabel>
                  <Textarea
                    minRows={4}
                    // maxRows={4}
                    {...methods.register('draftConfig.overview')}
                  />
                </FormControl>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={state.currentAccordionIndex === 1}
              onChange={(event, expanded) => {
                setState({
                  currentAccordionIndex: expanded ? 1 : null,
                });
              }}
            >
              <AccordionSummary>
                <Typography startDecorator={<LooksTwoRoundedIcon />}>
                  Start/End Screen
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={2}>
                  <Typography level="body-md">Start Screen</Typography>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      control={methods.control}
                      {...methods.register('draftConfig.startScreen.title')}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      minRows={2}
                      maxRows={4}
                      {...methods.register(
                        'draftConfig.startScreen.description'
                      )}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Call to action</FormLabel>
                    <Input
                      control={methods.control}
                      {...methods.register('draftConfig.startScreen.cta.label')}
                    />
                  </FormControl>

                  <Divider />
                  <Typography level="body-md">End Screen</Typography>
                  <FormControl>
                    <FormLabel>Call to action</FormLabel>
                    <Input
                      control={methods.control}
                      {...methods.register('draftConfig.endScreen.cta.label')}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Call to action URL</FormLabel>
                    <Stack
                      direction="row"
                      gap={1.5}
                      sx={(t) => ({
                        border: '1px solid',
                        borderColor: t.palette.divider,
                        borderRadius: t.radius.md,
                        boxShadow: t.shadow.xs,
                        p: 0.25,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      })}
                    >
                      <Input
                        variant="plain"
                        sx={{ py: 0 }}
                        control={methods.control}
                        // endDecorator={}
                        {...methods.register('draftConfig.endScreen.cta.url')}
                      />

                      <Controller
                        name="draftConfig.endScreen.cta.target"
                        render={({ field }) => (
                          <Select
                            defaultValue={'_blank'}
                            variant="outlined"
                            size="sm"
                            sx={{ height: '8px' }}
                            {...field}
                            onChange={(_, val) => {
                              field.onChange(val);
                              forceSubmit();
                            }}
                          >
                            <Option value="_blank">_blank</Option>
                            <Option value="_self">_self</Option>
                          </Select>
                        )}
                      ></Controller>
                    </Stack>
                  </FormControl>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={state.currentAccordionIndex === 2}
              onChange={(event, expanded) => {
                setState({
                  currentAccordionIndex: expanded ? 2 : null,
                });
              }}
            >
              <AccordionSummary>
                <Typography startDecorator={<Looks3RoundedIcon />}>
                  Form Fields
                </Typography>
              </AccordionSummary>
              {/* <Alert startDecorator={<InfoRoundedIcon />}>
               {`Field names have an impact on context understanding for
           the AI`}
             </Alert> */}
              <AccordionDetails>
                <FieldsInput />
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={state.currentAccordionIndex === 3}
              onChange={(event, expanded) => {
                setState({
                  currentAccordionIndex: expanded ? 3 : null,
                });
              }}
            >
              <AccordionSummary>
                <Typography startDecorator={<Looks4RoundedIcon />}>
                  Webhook
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <FormControl>
                  <FormLabel>Url</FormLabel>
                  <Input
                    control={methods.control}
                    placeholder="https://example.com/api/webhook"
                    {...methods.register('draftConfig.webhook.url')}
                  />
                  <FormHelperText>
                    Send form submission to the provided endpoint with a HTTP
                    POST request
                  </FormHelperText>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>

          <div
            className={clsx(
              'absolute bottom-0 w-full h-24 pointer-events-none bg-gradient-to-t',
              {
                'via-white from-white': mode === 'light',
                'via-black from-black': mode === 'dark',
              }
            )}
          ></div>
          <Button
            startDecorator={<RocketLaunch fontSize="sm" />}
            onClick={handlePublish}
            loading={publishFormMutation.isMutating || mutation.isMutating}
            disabled={mutation.isMutating || !methods.formState.isValid}
          >
            {mutation.isMutating ? 'Saving...' : 'Publish Updates'}
          </Button>
        </Stack>

        <Stack sx={{ width: '100%' }} gap={1}>
          <Stack
            sx={(t) => ({
              // border: '1px solid',
              borderRadius: t.radius.md,
              borderColor: t.palette.divider,
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            })}
          >
            {!!query?.data?.publishedConfig && (
              <Stack
                sx={{
                  width: '100%',
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  pt: 2,
                  pr: 2,
                }}
              >
                <Alert
                  variant="outlined"
                  size="sm"
                  startDecorator={
                    <LockRoundedIcon fontSize="sm" sx={{ opacity: 0.5 }} />
                  }
                  sx={{
                    borderRadius: 'lg',
                    width: '100%',
                    py: 0.5,
                    px: 1,
                  }}
                  className="backdrop-blur-lg"
                >
                  <Typography
                    level="body-sm"
                    endDecorator={<CopyButton text={formPublicUrl} />}
                  >
                    <a
                      href={formPublicUrl}
                      className="hover:underline"
                      target="_blank"
                    >
                      {formPublicUrl}
                    </a>
                  </Typography>
                </Alert>
              </Stack>
            )}
            <BlablaFormViewer
              formId={formId}
              config={{
                fields: draftConfig?.fields,
                startScreen: draftConfig?.startScreen,
                webhook: draftConfig?.webhook,
                schema: (query.data?.draftConfig as any)?.schema,
              }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

function BlablaFormEdior({ formId }: Props) {
  return (
    <BlablaFormProvider formId={formId}>
      {() => (
        <>
          <Form formId={formId} />
        </>
      )}
    </BlablaFormProvider>
  );
}

export default BlablaFormEdior;
