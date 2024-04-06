import { zodResolver } from '@hookform/resolvers/zod';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SendIcon from '@mui/icons-material/Send';
import {
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { FormConfigSchema, FormSubmitSchema } from '@chaindesk/lib/types/dtos';
import type { Form, Prisma } from '@chaindesk/prisma';
import FileUploaderDropZone from '@chaindesk/ui/FileUploaderDropZone';
import useFileUpload, { FileToUpload } from '@chaindesk/ui/hooks/useFileUpload';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import PhoneNumberInput from '@chaindesk/ui/PhoneNumberInput';
import PoweredBy from '@chaindesk/ui/PoweredBy';
import fieldTypesMap, { FieldProps, fieldsToZodSchema } from './fields-map';
import { type fieldUnion, type dynamicSchema, FieldType } from './types';

const dynamicSchema = (fields: FieldProps[]) =>
  z.object({
    ...fieldsToZodSchema(fields),
  });

function TraditionalForm({
  formId,
  conversationId,
  messageId,
  submissionId,
  isInEditor,
  isFormSubmitted,
  ...otherProps
}: {
  formId: string;
  conversationId?: string;
  messageId?: string;
  submissionId?: string;
  config?: any;
  isInEditor?: boolean;
  isFormSubmitted?: boolean;
}) {
  // const getFormQuery = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
  const getFormQuery = useSWR<Form>(
    formId
      ? `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/forms/${formId}`
      : null,
    fetcher
    // tab === 'editor' ? { refreshInterval: 2000 } : undefined
  );

  // const getConversationQuery = useSWR<
  //   Prisma.PromiseReturnType<typeof getConversation>
  // >(conversationId ? `/api/conversations/${conversationId}` : null, fetcher);

  const [state, setState] = useStateReducer({
    loading: false,
    files: [] as File[],
    isFormSubmitted: !!isFormSubmitted,
    hasErrored: false,
  });

  useEffect(() => {
    setState({
      isFormSubmitted: !!submissionId,
    });
  }, [submissionId]);

  useEffect(() => {
    setState({
      isFormSubmitted: !!isFormSubmitted,
    });
  }, [isFormSubmitted]);

  const config = useMemo(() => {
    return (
      !!isInEditor
        ? otherProps.config || getFormQuery?.data?.draftConfig
        : getFormQuery?.data?.publishedConfig
    ) as FormConfigSchema;
  }, [
    getFormQuery?.data?.draftConfig,
    getFormQuery?.data?.publishedConfig,
    otherProps.config,
  ]);

  const { upload: s3Upload } = useFileUpload();

  const shape = config?.fields?.map((field) => ({
    ...field,
  }));
  const keys = config?.fields?.map((field) => field.name);

  const methods = useForm<dynamicSchema<typeof keys>>({
    resolver: zodResolver(dynamicSchema(shape as FieldProps[])),
    mode: 'onChange',
  });

  const submitForm = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInEditor) {
      return setState({ isFormSubmitted: true });
    }

    try {
      setState({ loading: true, hasErrored: false });
      const values = methods.getValues();

      for (const field of config.fields) {
        if (field.type === FieldType.File) {
          const files = ((values as any)?.[field.name] as File[]) || [];

          if (files.length > 0) {
            const urls = await s3Upload(
              files.map((each) => ({
                case: 'formUpload',
                fileName: each.name,
                mimeType: each.type,
                file: each,
                formId,
                conversationId,
              }))
            );

            values[field.name] = JSON.stringify(urls);
          }
        }
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/forms/${formId}`,
        {
          formId,
          conversationId,
          formValues: values,
          messageId,
        } as FormSubmitSchema
      );

      if (response.status === 200) {
        setState({ isFormSubmitted: true });
      }
    } catch (e) {
      setState({ hasErrored: true });
      console.log('traditional form submit err:', e);
    } finally {
      setState({ loading: false });
    }
  };

  return (
    <Card
      variant="outlined"
      color="neutral"
      sx={{
        position: 'relative',
        overflowY: 'auto',
        width: '100%',
        maxHeight: '100%',
        flex: 1,
      }}
    >
      {/* {state.isFormSubmitted && !conversationId && (
        <Stack sx={{ position: 'absolute', top: -40, right: 0 }}>
          <Button
            variant="outlined"
            color="success"
            size="sm"
            onClick={() => setState({ isFormSubmitted: false })}
            endDecorator={<ReplayIcon />}
          >
            Retry
          </Button>
        </Stack>
      )} */}
      <CardContent
        component="div"
        sx={(t) => ({
          textAlign: 'center',
          alignItems: 'center',
          position: 'relative',
          width: '100%',
          display: 'flex',
        })}
      >
        <AnimatePresence>
          {state.isFormSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              // exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              key="component"
              className="h-full"
            >
              <Stack
                spacing={2}
                sx={{ p: 4 }}
                height="100%"
                justifyContent="center"
                alignItems="center"
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 42 }} color="primary" />
                <Typography level="h4">
                  {config?.endScreen?.successMessage ||
                    'Form Submitted Successfully!'}
                </Typography>
                {config?.endScreen?.cta?.label && (
                  <a
                    href={config?.endScreen?.cta?.url || '#'}
                    target={config?.endScreen?.cta?.target || '_blank'}
                  >
                    <Button variant="solid" size="lg" color="primary">
                      {config?.endScreen?.cta?.label}
                    </Button>
                  </a>
                )}
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!state.isFormSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              // exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              key="component"
              style={{ width: '100%' }}
            >
              {(config?.startScreen?.title ||
                config?.startScreen?.description) && (
                <Stack sx={{ mb: 2 }}>
                  {config?.startScreen?.title && (
                    <Typography level="h3">
                      {config?.startScreen?.title}
                    </Typography>
                  )}

                  {config?.startScreen?.description && (
                    <Typography level="body-md">
                      {config?.startScreen?.description}
                    </Typography>
                  )}
                </Stack>
              )}

              <Stack
                width="100%"
                spacing={2}
                onChange={(e) => {
                  // do not bubble up, not to trigger auto-save.
                  e.stopPropagation();
                }}
              >
                {config?.fields?.map((field) => (
                  <Stack
                    key={field.id}
                    spacing={1}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack direction="row">
                      <Typography level="title-md">{field.name}</Typography>
                      {field.required && (
                        <div className="text-red-500 ml-0.5">*</div>
                      )}
                    </Stack>
                    {fieldTypesMap[field.type as keyof typeof fieldTypesMap]?.({
                      formId,
                      conversationId,
                      methods,
                      ...field,

                      changeHandler: {
                        _: (name: string, value: any) => {
                          methods.setValue(name, value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        },
                      }['_'],
                    } as any)}
                  </Stack>
                ))}
              </Stack>
              <Stack mt={2}>
                <Button
                  type="submit"
                  disabled={
                    config?.fields?.length == 0 || !methods.formState.isValid
                  }
                  loading={state.loading}
                  onClick={submitForm}
                  size="md"
                  color="primary"
                  endDecorator={<SendIcon sx={{ fontSize: 'sm' }} />}
                  sx={{ with: '100%' }}
                >
                  Submit
                </Button>
                <Snackbar
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  open={state.hasErrored}
                  onClose={() => setState({ hasErrored: false })}
                  color={'danger'}
                >
                  Submission Failed, try again later.
                </Snackbar>
              </Stack>
            </motion.div>
          )}

          <Stack sx={{ mt: 2 }}>
            <PoweredBy />
          </Stack>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default memo(TraditionalForm);
