import {
  Alert,
  Avatar,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { UpdateMailInboxSchema } from '@chaindesk/lib/types/dtos';

import Input from './Input';
import MailInboxFormProvider from './MailInboxFormProvider';

type Props = {};

function MailInboxMessagePreview({}: Props) {
  const { watch } = useFormContext<UpdateMailInboxSchema>();

  const values = watch();

  const inboxEmail = `${values.alias}@on.chaindesk.ai`;

  return (
    <Card sx={{ width: '100%' }}>
      <Stack gap={2}>
        <Stack direction="row" gap={2}>
          <Avatar />
          <Stack>
            {values.fromName ? (
              <Stack direction="row" alignItems={'center'} gap={1}>
                <Typography level="title-lg">{values.fromName}</Typography>
                <Typography level="body-sm">{inboxEmail}</Typography>
              </Stack>
            ) : (
              <Typography level="title-lg">{inboxEmail}</Typography>
            )}
            RE: Issue with My Subscription
          </Stack>
        </Stack>
        <Divider />

        <Stack gap={2}>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {`Hi user,

Thank you for contacting us regarding your subscription concerns. We're here to help! To address the issue, please ensure your payment method is up-to-date and that there are no service outages affecting your account. You can check and update these details in the 'Account Settings' section of our website.

If the problem persists, please reply to this email with a description of the issue and any error messages you've received. We're committed to resolving this for you promptly.

Best regards,`}
          </Typography>

          {values.signature && (
            <div
              className="text-black whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: values.signature || '',
              }}
            />
          )}

          {values.showBranding && (
            <Typography level="body-sm">
              Sent from{' '}
              <a
                href="https://www.chaindesk.ai"
                target="_blank"
                style={{ textDecoration: 'underline' }}
              >
                Chaindesk
              </a>
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

export default MailInboxMessagePreview;
