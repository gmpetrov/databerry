import Alert from '@mui/joy/Alert';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Link from '@mui/joy/Link';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useTranslation } from 'next-i18next';
import React from 'react';

import SettingCard from './ui/SettingCard';
import CopyButton from './CopyButton';
import MailInboxFormProvider from './MailInboxFormProvider';

type Props = {
  inboxId: string;
};

function MailInboxInstallTab({ inboxId }: Props) {
  const { t } = useTranslation('email');
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
                  <FormLabel>{t('instructions')}</FormLabel>
                  <Stack gap={1}>
                    <Typography level="body-md">{t('setUp')}</Typography>
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
                      href="https://www.chaindesk.ai/help/email-inbox"
                      target="_blank"
                    >
                      {t('fullDocu')}
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
