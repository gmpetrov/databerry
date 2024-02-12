import {
  Alert,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Textarea,
} from '@mui/joy';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import React, { useRef } from 'react';
import useSWRMutation from 'swr/mutation';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';

import AlertPremiumFeature from './AlertPremiumFeature';
import Input from './Input';
import MailInboxFormProvider from './MailInboxFormProvider';
import MailInboxMessagePreview from './MailInboxMessagePreview';
import UsageLimitCard from './UsageLimitCard';
import UserFree from './UserFree';
import UserPremium from './UserPremium';

type Props = {
  inboxId: string;
};

function MailInboxEditorTab({ inboxId }: Props) {
  const { data: session } = useSession();
  const { t } = useTranslation('email');

  const startVerifyEmailMutation = useSWRMutation(
    `/api/mail-inboxes/${inboxId}/start-verify-email`,
    generateActionFetcher(HTTP_METHOD.POST)
  );

  return (
    <MailInboxFormProvider inboxId={inboxId}>
      {({ methods, query, refinement }) => {
        const values = methods.watch();
        const inboxEmail = `${values.alias}@on.chaindesk.ai`;

        return (
          <Stack direction="row" sx={{ width: '100%', maxWidth: 'xl' }} gap={2}>
            <Stack gap={2} sx={{ width: '100%' }}>
              {/* <Alias /> */}

              <Input
                control={methods.control}
                label="Alias"
                helperText={`${t('aliasSub')} ${inboxEmail}`}
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
                <UserPremium>
                  <Input
                    control={methods.control}
                    label={t('customMail')}
                    endDecorator={
                      query.data?.customEmail &&
                      query.data?.isCustomEmailVerified ? (
                        <Chip color="success">verified</Chip>
                      ) : (
                        query?.data?.customEmail && (
                          <Button
                            loading={startVerifyEmailMutation.isMutating}
                            size="sm"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              await startVerifyEmailMutation.trigger({});

                              await query.mutate();
                            }}
                          >
                            verify
                          </Button>
                        )
                      )
                    }
                    {...methods.register('customEmail')}
                  />
                </UserPremium>

                <UserFree>
                  <FormControl>
                    <FormLabel>{t('customMail')}</FormLabel>
                    <AlertPremiumFeature title="Custom email is a premium feature" />
                  </FormControl>
                </UserFree>

                {query?.data?.customEmail &&
                  query?.data?.customEmailVerificationTokenId && (
                    <Alert sx={{ mt: 1 }} color="primary">
                      A verification email has been sent to
                      <strong>{`${query?.data?.customEmail}`}</strong>
                    </Alert>
                  )}
              </FormControl>

              <Input
                control={methods.control}
                label={t('fromName')}
                {...methods.register('fromName')}
              />

              <FormControl>
                <FormLabel>Signature</FormLabel>
                <Textarea
                  // value={prompt || ''}
                  minRows={2}
                  {...methods.register('signature')}
                />
                <FormHelperText>{t('signatureSub')}</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Branding</FormLabel>

                <Checkbox
                  checked={Boolean(values.showBranding)}
                  label={t('showBranding')}
                  {...methods.register('showBranding')}
                  disabled={!session?.organization?.isPremium}
                />
                <FormHelperText>{t('showBrandingSub')}</FormHelperText>
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
