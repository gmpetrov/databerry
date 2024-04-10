import Alert from '@mui/joy/Alert';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Link from '@mui/joy/Link';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import React from 'react';

import CopyButton from '@chaindesk/ui/CopyButton';

import SettingCard from './ui/SettingCard';
import MailInboxFormProvider from './MailInboxFormProvider';

type Props = {
  inboxId: string;
};

function MailInboxInstallTab({ inboxId }: Props) {
  return (
    <MailInboxFormProvider inboxId={inboxId}>
      {({ methods, refinement }) => {
        const values = methods.watch();

        const inboxEmail = `${values.alias}@on.chaindesk.ai`;

        return (
          <Stack sx={{ width: '100%', maxWidth: 'md', mx: 'auto' }}>
            <SettingCard title="Setup" disableSubmitButton>
              <Stack gap={2}>
                <FormControl>
                  <FormLabel>Instructions</FormLabel>
                  <Stack gap={1}>
                    <Typography level="body-md">
                      Set up email forwarding from your email provider to:
                    </Typography>
                    <Alert>
                      <Typography
                        level="title-lg"
                        endDecorator={<CopyButton text={inboxEmail} />}
                      >
                        {inboxEmail}
                      </Typography>
                    </Alert>
                  </Stack>
                  <FormHelperText>
                    <Link
                      href="https://docs.chaindesk.ai/email-inbox/get-started"
                      target="_blank"
                    >
                      Full Documentation
                    </Link>
                  </FormHelperText>
                </FormControl>
              </Stack>
            </SettingCard>
          </Stack>
        );
      }}
    </MailInboxFormProvider>
  );
}

export default MailInboxInstallTab;
