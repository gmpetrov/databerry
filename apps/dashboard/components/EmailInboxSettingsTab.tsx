import DeleteIcon from '@mui/icons-material/Delete';
import { Checkbox, FormHelperText, FormLabel } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import FormControl from '@mui/joy/FormControl';
import Stack from '@mui/joy/Stack';
import { useRouter } from 'next/router';
import React from 'react';

import { RouteNames } from '@chaindesk/lib/types';
import Input from '@chaindesk/ui/Input';
import Loader from '@chaindesk/ui/Loader';

import SettingCard from './ui/SettingCard';
import MailInboxFormProvider from './MailInboxFormProvider';
import MailInboxMessagePreview from './MailInboxMessagePreview';

type Props = {
  inboxId: string;
};

function EmailInboxSettingsTab({ inboxId }: Props) {
  const router = useRouter();

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
                <FormLabel>Email Inbox Name</FormLabel>

                <Input
                  control={methods.control}
                  {...methods.register('name')}
                ></Input>
              </FormControl>
            </SettingCard>

            <SettingCard
              title="Delete Email Inbox"
              description="Delete the Email Inbox permanently"
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
                children: 'Delete',
                startDecorator: <DeleteIcon />,
                loading: deleteMutation.isMutating,
              }}
            >
              <FormControl sx={{ gap: 1 }}>
                <Alert color="danger">Delete the email inbox permanently</Alert>
              </FormControl>
            </SettingCard>
          </Stack>
        );
      }}
    </MailInboxFormProvider>
  );
}

export default EmailInboxSettingsTab;
