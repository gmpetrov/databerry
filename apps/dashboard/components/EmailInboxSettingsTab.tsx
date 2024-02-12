import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox, FormHelperText, FormLabel } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import FormControl from '@mui/joy/FormControl';
import Stack from '@mui/joy/Stack';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { RouteNames } from '@chaindesk/lib/types';

import SettingCard from './ui/SettingCard';
import Input from './Input';
import Loader from './Loader';
import MailInboxFormProvider from './MailInboxFormProvider';
import MailInboxMessagePreview from './MailInboxMessagePreview';

type Props = {
  inboxId: string;
};

function EmailInboxSettingsTab({ inboxId }: Props) {
  const router = useRouter();
  const { t } = useTranslation('email');

  return (
    <MailInboxFormProvider inboxId={inboxId}>
      {({ query, mutation, deleteMutation, methods }) => {
        if (!query.data && query.isLoading) {
          return <Loader />;
        }

        const values = methods.watch();

        return (
          <Stack sx={{ width: '100%', maxWidth: 'md', mx: 'auto', gap: 2 }}>
            <SettingCard
              title="General Settings"
              // description="Deploy your agent with the following widgets or integrations"
              disableSubmitButton
              cardProps={{
                sx: {
                  width: '100%',
                  // maxWidth: 'md',
                  // mx: 'auto',
                },
              }}
            >
              <FormControl>
                <FormLabel>{t('titleSmall')} Name</FormLabel>

                <Input
                  control={methods.control}
                  {...methods.register('name')}
                ></Input>
              </FormControl>
            </SettingCard>

            <SettingCard
              title={t('deleteEmail')}
              description={t('deleteEmailSub')}
              cardProps={{
                color: 'danger',
              }}
              submitButtonProps={{
                onClick: async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const confirmed = await window.confirm(
                    'This is irreversible. Are you sure?'
                  );

                  if (confirmed) {
                    await deleteMutation.trigger();
                    router.replace(RouteNames.EMAIL_INBOXES);
                  }
                },
                color: 'danger',
                children: `${t('deleteCta')}`,
                startDecorator: <DeleteIcon />,
                loading: deleteMutation.isMutating,
              }}
            >
              <FormControl sx={{ gap: 1 }}>
                <Alert color="danger">{t('deleteEmailSub')}</Alert>
              </FormControl>
            </SettingCard>
          </Stack>
        );
      }}
    </MailInboxFormProvider>
  );
}

export default EmailInboxSettingsTab;
