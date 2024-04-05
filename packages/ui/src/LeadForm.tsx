import { zodResolver } from '@hookform/resolvers/zod';

import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import ErrorIcon from '@mui/icons-material/Error';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LeadCaptureToolchema,
  LeadFormSchema,
} from '@chaindesk/lib/types/dtos';

import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import i18n from '@chaindesk/lib/locales/i18next';
import Button from '@mui/joy/Button';
import PhoneNumberInput from './PhoneNumberInput';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Input from './Input';
import { motion } from 'framer-motion';

export const LEAD_FORM_ID = 'lead-form';

export default function LeadForm(
  props: {
    agentId: string;
    conversationId: string;
    visitorId: string;
    visitorEmail?: string;
    onSubmitSucess?: (props: { email?: string; phoneNumber?: string }) => any;
  } & LeadCaptureToolchema['config']
) {
  const ref = useRef<HTMLFormElement>(null);
  const { t } = useTranslation('', { i18n });
  const [state, setState] = useStateReducer({
    isCaptureLoading: false,
    isCaptureSuccess: false,
    visitorEmail: props.visitorEmail || '',
    emailInputValue: '',
    validPayload: undefined,
  });

  const schema = z.object({
    ...(props.isEmailEnabled ? { email: z.string().email() } : {}),
    ...(props.isPhoneNumberEnabled ? { phoneNumber: z.string().min(1) } : {}),
  });

  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const handleSubmitCaptureForm = async (values: z.infer<typeof schema>) => {
    setState({ isCaptureLoading: true });

    await fetch(
      `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/agents/${props.agentId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: props.conversationId,
          visitorId: props.visitorId,

          // Form Values
          visitorEmail: values.email,
          phoneNumber: values.phoneNumber,
        }),
      }
    );

    await props.onSubmitSucess?.(values as any);

    setState({
      isCaptureLoading: false,
      isCaptureSuccess: true,
    });
  };

  const chatboxRoot = useMemo(() => {
    if (typeof window !== 'undefined') {
      return ref.current?.closest?.('.chaindesk-widget');
    }
    return null;
  }, [ref.current]);

  console.log('ERRORS-------->', methods.formState.errors);

  return (
    <Stack
      ref={ref}
      onChange={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        methods.handleSubmit(handleSubmitCaptureForm)(e);
      }}
      component={motion.form}
      direction="column"
      gap={1}
      sx={{
        width: '100%',
        height: '100%',
        pt: 1,
        pb: 2,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Typography
        startDecorator={<ErrorIcon sx={{ fontSize: 'sm' }} />}
        level="body-xs"
        fontWeight={600}
      >
        {t('chatbubble:lead.instruction')}
      </Typography>
      {props.isEmailEnabled && (
        <Input
          control={methods.control}
          sx={{ width: '100%' }}
          size="sm"
          type="email"
          placeholder={t('chatbubble:lead.email')}
          startDecorator={<EmailRoundedIcon />}
          // autoFocus={!!props.isRequired}
          defaultValue={props.visitorEmail}
          {...methods.register('email')}
        />
      )}
      {props.isPhoneNumberEnabled && (
        <PhoneNumberInput
          control={methods.control as any}
          {...(methods.register('phoneNumber') as any)}
          // placeholder={t('chatbubble:lead.phoneNumber')}
          placeholder={'phone number'}
          handleChange={(value) => {
            methods.setValue('phoneNumber', value as never, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          selectProps={{
            slotProps: {
              listbox: {
                // Fix the styling issue with shadow root usage. Similar issue: https://stackoverflow.com/questions/69828392/mui-select-drop-down-options-not-styled-when-using-entry-point-to-insert-scoped
                container: chatboxRoot,
              },
            },
          }}
        />
      )}
      <Button
        size="sm"
        type="submit"
        color="primary"
        loading={state.isCaptureLoading}
        disabled={!methods.formState.isValid}
      >
        <SendRoundedIcon sx={{ fontSize: 'sm' }} />
      </Button>
    </Stack>
  );
}
