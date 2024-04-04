import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';
import {
  Button,
  Card,
  CardContent,
  Chip,
  ChipDelete,
  Divider,
  Input,
  Option,
  Select,
  Snackbar,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import useFileUpload, { FileToUpload } from '@app/hooks/useFileUpload';
import useStateReducer from '@app/hooks/useStateReducer';
import {
  getConversation,
  updateConversation,
} from '@app/pages/api/conversations/[conversationId]';
import { getForm } from '@app/pages/api/forms/[formId]';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { FormConfigSchema, FormSubmitSchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';
import PhoneNumberInput from '@chaindesk/ui/PhoneNumberInput';
import PoweredBy from '@chaindesk/ui/PoweredBy';

import FileUploader from './FileUploader';
import FileUploaderDropZone from './FileUploaderDropZone';

export enum FieldType {
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  Text = 'text',
  TextArea = 'textArea',
  Select = 'select',
  File = 'file',
}

type dynamicSchema<T extends string[]> = {
  [k in T[number]]: string;
};

type fieldUnion =
  | 'email'
  | 'phoneNumber'
  | 'text'
  | 'textArea'
  | 'select'
  | 'file'
  | 'multiple_choice';

const shapeTozod = (
  arr: { name: string; required: boolean; type: fieldUnion }[]
) => {
  const obj: Record<string, any> = {};
  arr?.map(({ name, required, type }) => {
    let zodType;
    switch (type) {
      case FieldType.Email:
        zodType = z.string().email();
        break;
      case FieldType.TextArea:
        zodType = required ? z.string().min(25) : z.string().optional();
        break;
      case FieldType.Select:
        zodType = required ? z.string().min(1) : z.string().optional();
        break;
      case FieldType.PhoneNumber:
        const phoneRegex = new RegExp(
          /^(?:\+?(\d{1,3}))?[-. (]*(?:\d{1,4})[-. )]*(\d{1,3})[-. ]*(\d{2,4})[-. ]*(\d{2,4})$/
        );
        zodType = z.string().regex(phoneRegex, 'Invalid Number!');
        break;
      case FieldType.Text:
        zodType = required ? z.string().min(1) : z.string().optional();
        break;
      case FieldType.File:
        const fileSchema = z.any();

        zodType = required
          ? z.array(fileSchema).min(1)
          : z.array(fileSchema).optional();
        break;
      default:
        zodType = z.string();
    }
    obj[name] = required ? zodType : zodType.optional();
  });
  return obj;
};

const dynamicSchema = (
  arr: { name: string; required: boolean; type: fieldUnion }[]
) =>
  z.object({
    ...shapeTozod(arr),
  });

const fieldTypesMap = {
  email: ({ methods, placeholder }: { methods: any; placeholder: string }) => (
    <Stack>
      <Input
        {...methods?.register('email')}
        sx={{ width: '100%' }}
        placeholder={placeholder}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.email?.message}
      </Typography>
    </Stack>
  ),
  phoneNumber: ({
    name,
    methods,
    placeholder,
  }: {
    name: string;
    methods: any;
    placeholder: string;
  }) => (
    <Stack>
      <PhoneNumberInput
        control={methods.control as any}
        {...(methods.register(name) as any)}
        // placeholder={t('chatbubble:lead.phoneNumber')}
        placeholder={placeholder}
        handleChange={(value) => {
          methods.setValue(name, value as never, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        // selectProps={{
        //   slotProps: {
        //     listbox: {
        //       // Fix the styling issue with shadow root usage. Similar issue: https://stackoverflow.com/questions/69828392/mui-select-drop-down-options-not-styled-when-using-entry-point-to-insert-scoped
        //       container: chatboxRoot,
        //     },
        //   },
        // }}
      />

      {/* <Input
        {...methods?.register(name)}
        placeholder={placeholder}
        sx={{ width: '100%' }}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.[name]?.message}
      </Typography> */}
    </Stack>
  ),
  text: ({
    name,
    methods,
    placeholder,
  }: {
    name: string;
    methods: any;
    placeholder: string;
  }) => (
    <Stack>
      <Input
        sx={{ width: '100%' }}
        {...methods?.register(name || 'text')}
        placeholder={placeholder || ''}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.[name || 'text']?.message}
      </Typography>
    </Stack>
  ),
  textArea: ({
    name,
    methods,
    placeholder,
  }: {
    name: string;
    methods: any;
    placeholder?: string;
  }) => (
    <Stack>
      <Textarea
        sx={{ width: '100%' }}
        {...methods?.register(name)}
        minRows={4}
        placeholder={placeholder || ''}
      />
      <Typography level="body-xs" color="danger" sx={{ textAlign: 'left' }}>
        {methods?.formState?.errors?.[name]?.message}
      </Typography>
    </Stack>
  ),
  select: ({
    name,
    options,
    changeHandler,
    placeholder,
  }: {
    name: string;
    options: string[];
    changeHandler(name: string, value: string): void;
    placeholder: string;
  }) => (
    <Select
      sx={{
        width: '100%',
      }}
      placeholder={placeholder}
      onChange={(_, value) => {
        if (value) {
          changeHandler(name, value as string);
        }
      }}
    >
      {options?.map((option, i) => (
        <Option key={i} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  ),
  file: ({
    name,
    s3Upload,
    placeholder,
    changeHandler,
    formId,
    conversationId,
  }: {
    name: string;
    s3Upload(items: FileToUpload[]): Promise<string[]>;
    placeholder?: string;
    formId: string;
    conversationId?: string;
    changeHandler(name: string, value: File[]): void;
  }) => {
    return (
      <FileUploaderDropZone
        variant="outlined"
        placeholder={placeholder || 'Browse Files'}
        changeCallback={async (files) => {
          changeHandler(name, files);
        }}
      />
    );
  },
};

function TraditionalForm({
  formId,
  conversationId,
}: {
  formId: string;
  conversationId?: string;
}) {
  const {
    query: { tab },
  } = useRouter();

  const getFormQuery = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
    formId ? `/api/forms/${formId}` : null,
    fetcher,
    tab === 'editor' ? { refreshInterval: 2000 } : undefined
  );

  const getConversationQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversation>
  >(conversationId ? `/api/conversations/${conversationId}` : null, fetcher);

  const [state, setState] = useStateReducer({
    loading: false,
    files: [] as File[],
    isFormSubmitted: false,
    hasErrored: false,
  });

  useEffect(() => {
    setState({
      isFormSubmitted: (getConversationQuery.data?.metadata as any)
        ?.isFormSubmitted,
    });
  }, [getConversationQuery.data?.metadata]);

  const config = useMemo(() => {
    return (
      tab === 'editor'
        ? getFormQuery?.data?.draftConfig
        : getFormQuery?.data?.publishedConfig
    ) as FormConfigSchema;
  }, [getFormQuery?.data?.draftConfig, getFormQuery?.data?.publishedConfig]);

  const { upload: s3Upload } = useFileUpload();

  const shape = config?.fields?.map((field) => ({
    name: field.name,
    required: field.required,
    type: field.type,
  }));
  const keys = config?.fields?.map((field) => field.name);

  const methods = useForm<dynamicSchema<typeof keys>>({
    resolver: zodResolver(dynamicSchema(shape)),
    mode: 'onChange',
  });

  const conversationMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateConversation>
  >(
    conversationId
      ? `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/conversations/${conversationId}`
      : null,
    generateActionFetcher(HTTP_METHOD.PATCH)
  );

  const submitForm = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

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
        } as FormSubmitSchema
      );

      // Do not move to /api/events, a form is not necessary linked to conversation.
      if (conversationId) {
        await conversationMutation.trigger({
          metadata: { isFormSubmitted: true },
        } as any);
      }

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
        flex: 1,
      }}
    >
      {state.isFormSubmitted && !conversationId && (
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
      )}
      <CardContent
        sx={(t) => ({
          textAlign: 'center',
          alignItems: 'center',
          position: 'relative',
          overflowY: 'auto',
          width: '100%',
          display: 'flex',
        })}
      >
        <AnimatePresence>
          {state.isFormSubmitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                    'Form Submitted Succcessfully!'}
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
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              key="component"
              className="w-full"
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

                    {fieldTypesMap[field.type as keyof typeof fieldTypesMap]({
                      formId,
                      conversationId,
                      methods,
                      name: field.name,
                      placeholder: (field as any)?.placeholder,
                      changeHandler: {
                        _: (name: string, value: any) => {
                          methods.setValue(name, value);
                          methods.trigger();
                        },
                      }['_'],
                      options: (field as any)?.options as string[],
                      s3Upload,
                    })}
                  </Stack>
                ))}
              </Stack>
              <Stack mt={2}>
                <Button
                  type="submit"
                  disabled={
                    config?.fields.length == 0 || !methods.formState.isValid
                  }
                  loading={state.loading}
                  onClick={submitForm}
                  size="md"
                  color="primary"
                  endDecorator={<SendIcon fontSize="sm" />}
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
