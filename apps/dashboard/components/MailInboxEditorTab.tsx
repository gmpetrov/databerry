import {
  Alert,
  Checkbox,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Textarea,
} from '@mui/joy';
import { useSession } from 'next-auth/react';
import React, { useRef } from 'react';

import Input from './Input';
import MailInboxFormProvider from './MailInboxFormProvider';
import MailInboxMessagePreview from './MailInboxMessagePreview';

type Props = {
  inboxId: string;
};

function MailInboxEditorTab({ inboxId }: Props) {
  const { data: session } = useSession();
  return (
    <MailInboxFormProvider inboxId={inboxId}>
      {({ methods, refinement }) => {
        const values = methods.watch();
        const inboxEmail = `${values.alias}@on.chaindesk.ai`;

        return (
          <Stack direction="row" sx={{ width: '100%', maxWidth: 'xl' }} gap={2}>
            <Stack gap={2} sx={{ width: '100%' }}>
              {/* <Alias /> */}

              <Input
                control={methods.control}
                label="Alias"
                helperText={`Emails will be sent from: ${inboxEmail}`}
                endDecorator={
                  !!methods.formState.dirtyFields?.alias &&
                  (methods.formState.isValidating ||
                    methods.formState.isSubmitting) ? (
                    <CircularProgress size="sm" />
                  ) : undefined
                }
                // onInput={e => e.currentTarget.value = e.target.value.toLowerCase()}
                {...methods.register('alias', {
                  // onChange: (e) => {
                  //   e.target.value = e.target.value.toLowerCase();
                  //   return refinement?.invalidate();
                  // },
                })}
                onBlur={(e) => {}}
              />

              <FormControl>
                <FormLabel>Custom email</FormLabel>
                <Alert color="warning">Coming Soon 🤗</Alert>
              </FormControl>

              <Input
                control={methods.control}
                label="FROM name"
                {...methods.register('fromName')}
              />

              <FormControl>
                <FormLabel>Signature</FormLabel>
                <Textarea
                  // value={prompt || ''}
                  minRows={2}
                  {...methods.register('signature')}
                />
                <FormHelperText>Basic HTML is allowed</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Branding</FormLabel>

                <Checkbox
                  checked={!!values.hideBranding}
                  label="Show Chaindesk Branding"
                  {...methods.register('hideBranding')}
                  disabled={!session?.organization?.isPremium}
                />
                <FormHelperText>
                  A premium account is required to disable this option
                </FormHelperText>
              </FormControl>
            </Stack>

            <MailInboxMessagePreview />
          </Stack>
        );
      }}
    </MailInboxFormProvider>
  );
}

export default MailInboxEditorTab;
