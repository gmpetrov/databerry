import { zodResolver } from '@hookform/resolvers/zod';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SendIcon from '@mui/icons-material/Send';
import {
  Button,
  Card,
  CardContent,
  Snackbar,
  Stack,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import useFileUpload from '@chaindesk/ui/hooks/useFileUpload';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import { FormConfigSchema, FormSubmitSchema } from '@chaindesk/lib/types/dtos';
import PoweredBy from '@chaindesk/ui/PoweredBy';
import fieldTypesMap, {
  fieldsToZodSchema,
} from '@chaindesk/ui/utils/fieldTypesMap';
import { type dynamicSchema, FieldType, type fieldUnion } from './types/form';

function TraditionalForm({
  formId,
  conversationId,
  messageId,
  isFormSubmitted,
  config,
}: {
  formId: string;
  conversationId?: string;
  messageId?: string;
  isFormSubmitted?: boolean;
  config: FormConfigSchema;
}) {
  const [state, setState] = useStateReducer({
    loading: false,
    files: [] as File[],
    isFormSubmitted: isFormSubmitted ?? false,
    hasErrored: false,
  });

  useEffect(() => {
    setState({
      isFormSubmitted,
    });
  }, [isFormSubmitted]);

  const { upload: s3Upload } = useFileUpload();

  const dynamicSchema = (
    fields: { name: string; required: boolean; type: fieldUnion }[]
  ) =>
    z.object({
      ...fieldsToZodSchema(fields),
    });

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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                      name: field.name,
                      placeholder: (field as any)?.placeholder,
                      changeHandler: {
                        _: (name: string, value: any) => {
                          methods.setValue(name, value);
                          methods.trigger();
                        },
                      }['_'],
                      options: (field as any)?.options as string[],
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
                  endDecorator={<SendIcon fontSize="small" />}
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
