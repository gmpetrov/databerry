import { CheckIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';
import {
  Button,
  Card,
  CardContent,
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
import { memo } from 'react';
import { useForm } from 'react-hook-form';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import useFileUpload, { FileToUpload } from '@app/hooks/useFileUpload';
import useStateReducer from '@app/hooks/useStateReducer';
import { updateConversation } from '@app/pages/api/conversations/[conversationId]';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import { FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';

import FileUploader from './FileUploader';

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
      case FieldType.PhoneNumber:
        const phoneRegex = new RegExp(
          /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
        );
        zodType = z.string().regex(phoneRegex, 'Invalid Number!');
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
    <Input
      {...methods?.register('email')}
      sx={{ width: '100%' }}
      placeholder={placeholder || 'e.g., adam@chaindesk.ai'}
    />
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
    <Input
      {...methods?.register(name)}
      placeholder={placeholder}
      sx={{ width: '100%' }}
    />
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
    <Input
      sx={{ width: '100%' }}
      {...methods?.register(name || 'text')}
      placeholder={placeholder || ''}
    />
  ),
  textArea: ({
    name,
    methods,
    placeholder,
  }: {
    name: string;
    methods: any;
    placeholder: string;
  }) => (
    <Textarea
      sx={{ width: '100%' }}
      {...methods?.register(name || 'textArea')}
      minRows={4}
      placeholder={placeholder || ''}
    />
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
      placeholder={placeholder || 'select an option'}
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
    changeHandler(name: string, value: string): void;
  }) => (
    <FileUploader
      variant="outlined"
      placeholder={placeholder || 'Upload Files'}
      changeCallback={async (f) => {
        const filesUrls = await s3Upload(
          f.map((each) => ({
            case: 'formUpload',
            fileName: each.name,
            mimeType: each.type,
            file: each,
            formId,
            conversationId,
          }))
        );
        changeHandler(name, JSON.stringify(filesUrls));
      }}
    />
  ),
};

function TraditionalForm({
  config,
  formId,
  conversationId,
}: {
  config: FormConfigSchema;
  formId: string;
  conversationId?: string;
}) {
  const [state, setState] = useStateReducer({
    loading: false,
    files: [] as File[],
    isFormSubmitted: false,
    hasErrored: false,
  });

  const { upload: s3Upload } = useFileUpload();

  const shape = config?.fields?.map((field) => ({
    name: field.name,
    required: field.required,
    type: field.type,
  }));
  const keys = config?.fields?.map((field) => field.name);

  const methods = useForm<dynamicSchema<typeof keys>>({
    resolver: zodResolver(dynamicSchema(shape)),
    mode: 'all',
  });

  const conversationMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof updateConversation>
  >(
    conversationId ? `/api/conversations/${conversationId}` : null,
    generateActionFetcher(HTTP_METHOD.PATCH)
  );

  const submitForm = async () => {
    try {
      setState({ loading: true, hasErrored: false });
      const values = methods.getValues();
      const response = await axios.post('/api/events', {
        event: {
          type: 'form-submission',
          formId,
          formValues: values,
        },
        // TODO: make valid form specific token.
        token: '123456',
      });
      if (conversationId) {
        await conversationMutation.trigger({
          metadata: { isTraditionalFormFilled: true },
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
        height: '380px',
        overflowY: 'visible',
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
            Re-try
          </Button>
        </Stack>
      )}
      <CardContent
        sx={{
          textAlign: 'center',
          alignItems: 'center',
          position: 'relative',
          minWidth: '300px',
          overflowY: 'scroll',
        }}
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
                height="100%"
                justifyContent="center"
                alignItems="center"
              >
                <CheckIcon className="w-12 font-bold text-green-600 border-2 border-green-600 rounded-full" />
                <Typography level="title-md">
                  {config.endScreen?.successMessage ||
                    'The Form Was Submitted Succcessfully!'}
                </Typography>
                {config?.endScreen?.cta?.label && (
                  <a
                    href={config?.endScreen?.cta?.url || '#'}
                    target={config?.endScreen?.cta?.target || '_blank'}
                  >
                    <Button variant="solid" size="lg" color="success">
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
              <Typography level="title-md">
                {config.startScreen?.title}
              </Typography>
              <Typography level="body-md">
                {config.startScreen?.description}
              </Typography>
              <Divider sx={{ mb: 1 }} />

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
                        _: (name: string, value: string) => {
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
              <Stack direction="row-reverse" width="100%" mt={2}>
                <Button
                  disabled={
                    config?.fields.length == 0 || !methods.formState.isValid
                  }
                  loading={state.loading || methods.formState.isValidating}
                  onClick={submitForm}
                  size="md"
                  color="primary"
                  endDecorator={<SendIcon fontSize="sm" />}
                >
                  Send
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
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default memo(TraditionalForm);
