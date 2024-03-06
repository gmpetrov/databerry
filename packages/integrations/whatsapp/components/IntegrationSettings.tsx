import React, { useCallback } from 'react';
import { set, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@chaindesk/ui/Input';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import JoyInput from '@mui/joy/Input';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import axios, { AxiosError } from 'axios';
import { AddServiceProviderWhatsappSchema } from '@chaindesk/lib/types/dtos';
import CopyButton from '@chaindesk/ui/CopyButton';
import { ApiErrorType } from '@chaindesk/lib/api-error';
import LinkButton from '@chaindesk/ui/LinkButton';

import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepButton from '@mui/joy/StepButton';
import StepIndicator from '@mui/joy/StepIndicator';
import Check from '@mui/icons-material/Check';
import toast from 'react-hot-toast';
import { ServiceProvider } from '@chaindesk/prisma';

type Props = {
  onSubmitSuccess?: any;
  agentId?: string;
};

const Schema = AddServiceProviderWhatsappSchema;

type Schema = z.infer<typeof Schema>;

const steps = ['Requirements', 'User Token', 'Phone Number', 'Webhook'];

function IntegrationSettings({ onSubmitSuccess, agentId }: Props) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      type: 'whatsapp',
      agentId: agentId,
    },
    mode: 'onChange',
  });

  const values = methods.watch();

  const onSubmit = async (values: Schema) => {
    try {
      const { data } = await axios.post<ServiceProvider>(
        `/api/integrations/whatsapp/add`,
        values
      );

      const dataConfig = data.config as Schema['config'];
      methods.setValue('id', data.id, {
        shouldValidate: true,
        shouldDirty: true,
      });

      methods.setValue(
        'config.webhookVerifyToken',
        dataConfig.webhookVerifyToken,
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );

      setActiveStep(3);

      return data;
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err?.response?.data?.error ===
          ApiErrorType.INTEGRATION_VALIDATION_FAILED
      ) {
        toast.error('Phone number already registred', {
          position: 'top-right',
        });
      } else {
        toast.error('Something went wrong', {
          position: 'top-right',
        });
        console.error(err);
      }

      return null;
    }
  };

  const handleValidateAccessToken = useCallback(
    async (token: string) => {
      try {
        const isValid = await methods.trigger('accessToken');

        if (!isValid) {
          return;
        }

        setIsLoading(true);

        const { data } = await axios.get(
          `https://graph.facebook.com/v17.0/debug_token?input_token=${token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const appId = data.data.app_id as string;
        const expiresAt = data.data.expires_at as number;
        const scopes = data.data.scopes as string[];

        if (expiresAt !== 0) {
          let msg =
            'Token has an expiration date. Create the token again with and set the expiration date to "Never"';

          toast.error(msg, {
            position: 'top-right',
          });

          return methods.setError('accessToken', {
            message: msg,
          });
        }

        if (
          ['whatsapp_business_management', 'whatsapp_business_messaging'].find(
            (scope) => !scopes.includes(scope)
          )
        ) {
          let msg = `Token is missing scopes 'whatsapp_business_management', 'whatsapp_business_messaging'`;
          toast.error(msg, {
            position: 'top-right',
          });
          return methods.setError('accessToken', {
            message: msg,
          });
        }

        methods.setValue('config.appId', appId, {
          shouldValidate: true,
          shouldDirty: true,
        });

        setActiveStep(2);
      } catch (err) {
        let error = 'Error';
        if (err instanceof AxiosError) {
          if (err.response?.data?.error?.message) {
            error = err.response?.data?.error?.message as string;
          }
        }

        toast.error(error, {
          position: 'top-right',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [methods.setValue, methods.setError, methods.trigger]
  );

  const handleValidatePhoneNumberId = useCallback(
    async (phoneNumberId: string) => {
      try {
        const isValid = await methods.trigger('config.phoneNumberId');

        if (!isValid) {
          return;
        }

        setIsLoading(true);

        const {
          data: { display_phone_number },
        } = (await axios.get(
          `https://graph.facebook.com/v17.0/${phoneNumberId}`,
          {
            headers: {
              Authorization: `Bearer ${values.accessToken}`,
            },
          }
        )) as { data: { display_phone_number: string } };

        const phoneNumber = `${
          display_phone_number.startsWith('+') ? '' : '+'
        }${display_phone_number.replace(/[\s-]/g, '')}`;

        methods.setValue('config.phoneNumber', phoneNumber, {
          shouldValidate: true,
          shouldDirty: true,
        });

        // const isFormValid = await methods.trigger();

        // if (!isFormValid) {
        //   console.log(methods.formState.isValid);
        //   console.log(methods.formState.isValid);
        //   throw new Error('Invalid form');
        // }

        // const { data } = await axios.post<ServiceProvider>(
        //   '/api/integrations/whatsapp/add',
        //   methods.getValues()
        // );

        await methods.handleSubmit(onSubmit)();

        // if (!data?.id) {
        //   throw new Error('Error creating service provider');
        // }
      } catch (err) {
        console.log('err', err);
        let error = 'Error';
        if (err instanceof AxiosError) {
          if (err.response?.data?.error?.message) {
            error = err.response?.data?.error?.message as string;
          }
        }

        toast.error(error, {
          position: 'top-right',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [methods.trigger, methods.setValue, methods.setError, values.accessToken]
  );

  const webhookUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/integrations/whatsapp/webhook?service_provider_id=${values.id}`;

  console.log('errors', methods.formState.errors);

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={methods.handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        ['kbd']: {
          fontSize: '1rem',
          fontFamily: 'Bricolage Grotesque',
        },
      }}
    >
      <Stepper sx={{ width: '100%' }}>
        {steps.map((step, index) => (
          <Step
            key={step}
            indicator={
              <StepIndicator
                variant={activeStep <= index ? 'soft' : 'solid'}
                color={activeStep < index ? 'neutral' : 'primary'}
              >
                {activeStep <= index ? index + 1 : <Check />}
              </StepIndicator>
            }
            sx={{
              '&::after': {
                ...(activeStep > index &&
                  index !== 2 && { bgcolor: 'primary.solidBg' }),
              },
            }}
          >
            <StepButton onClick={() => setActiveStep(index)}>{step}</StepButton>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Stack gap={2}>
          <div className="text-sm prose-sm prose dark:prose-invert">
            <p>
              Make sure you have{' '}
              <LinkButton
                linkProps={{
                  href: 'https://www.chaindesk.ai/help/whatsapp',
                  target: '_blank',
                }}
                buttonProps={{
                  size: 'sm',
                  color: 'primary',
                  variant: 'soft',
                }}
              >
                created a WhatsApp Meta App
              </LinkButton>
            </p>
            <p>You should be able to get to this page:</p>
            <img src="/integrations/whatsapp/meta-app-dashboard.jpg" alt="" />
          </div>
          <Button
            type="button"
            sx={{ ml: 'auto' }}
            onClick={() => setActiveStep(1)}
          >
            Continue
          </Button>
        </Stack>
      )}

      {activeStep === 1 && (
        <Stack gap={2}>
          <div className="text-sm prose-sm prose dark:prose-invert">
            <ul className="space-y-3 text-lg list-decimal">
              <li>
                Go to your{' '}
                <LinkButton
                  linkProps={{
                    href: 'https://business.facebook.com/settings/system-users',
                    target: '_blank',
                  }}
                  buttonProps={{
                    size: 'sm',
                    color: 'neutral',
                    variant: 'soft',
                  }}
                >
                  System users page
                </LinkButton>
              </li>
              <li>
                <p>
                  Create a new user by clicking on <kbd>Add</kbd>
                </p>
              </li>
              <li>
                Fill it with any name and give it the <kbd>Admin</kbd> role
              </li>
              <li>
                Click on <kbd>Add assets</kbd>. Under <kbd>Apps</kbd>, look for
                your previously created app, select it and check{' '}
                <kbd>Manage app</kbd>
              </li>
              <li>Now, click on Generate new token. Select your app.</li>
              <ul>
                <li>Token expiration: Never</li>
                <li>
                  Available Permissions: <kbd>whatsapp_business_messaging</kbd>,{' '}
                  <kbd>whatsapp_business_management</kbd>
                </li>
              </ul>
              <li>Copy and paste the generated token:</li>
              <Input
                control={methods.control}
                label="System User Token"
                {...methods.register('accessToken')}
              />
            </ul>
          </div>
          <Button
            type="button"
            loading={isLoading}
            sx={{ ml: 'auto' }}
            disabled={!values.accessToken}
            onClick={() => handleValidateAccessToken(values.accessToken!)}
          >
            Continue
          </Button>
        </Stack>
      )}
      {activeStep === 2 && (
        <Stack gap={2}>
          <div className="text-sm prose-sm prose dark:prose-invert">
            <ul className="space-y-3 text-lg list-decimal">
              <li>
                Go to your{' '}
                <LinkButton
                  linkProps={{
                    href: `https://developers.facebook.com/apps/${values?.config?.appId}/whatsapp-business/wa-dev-console`,
                    target: '_blank',
                  }}
                  buttonProps={{
                    size: 'sm',
                    color: 'neutral',
                    variant: 'soft',
                  }}
                >
                  System users page
                </LinkButton>
              </li>
              <li>
                Add your phone number by clicking on the{' '}
                <kbd>Add phone number</kbd> button.
              </li>
              <li>
                Select a phone number and paste the associated{' '}
                <kbd>Phone number ID</kbd> and{' '}
                <kbd>WhatsApp Business Account ID</kbd>:
                <img
                  className="w-full h-auto"
                  src="/integrations/whatsapp/get-phone-number-id.jpg"
                  alt="get phone number id"
                />
              </li>
              <Input
                control={methods.control}
                label="Phone Number ID"
                {...methods.register('config.phoneNumberId')}
              />
            </ul>
          </div>
          <Button
            type="button"
            loading={isLoading}
            sx={{ ml: 'auto' }}
            disabled={!values?.config?.phoneNumberId}
            onClick={() =>
              handleValidatePhoneNumberId(values.config.phoneNumberId!)
            }
          >
            Continue
          </Button>
        </Stack>
      )}
      {activeStep === 3 && (
        <Stack gap={2}>
          <div className="text-sm prose-sm prose dark:prose-invert">
            <ul className="space-y-3 text-lg list-decimal">
              <li>
                In your{' '}
                <LinkButton
                  linkProps={{
                    href: `https://developers.facebook.com/apps/${values?.config?.appId}/whatsapp-business/wa-settings`,
                    target: '_blank',
                  }}
                  buttonProps={{
                    size: 'sm',
                    color: 'neutral',
                    variant: 'soft',
                  }}
                >
                  WhatsApp Settings page
                </LinkButton>
                , click on the Edit button and insert the following values:
                <ul className="space-y-4">
                  <li>
                    Callback URL:
                    <JoyInput
                      value={webhookUrl}
                      endDecorator={<CopyButton text={webhookUrl} />}
                    />
                  </li>
                  <li>
                    Verify Token:
                    <JoyInput
                      value={values.config.webhookVerifyToken}
                      endDecorator={
                        <CopyButton
                          text={values.config.webhookVerifyToken || ''}
                        />
                      }
                    />
                  </li>
                  <li>
                    Webhook fields: <kbd>check messages</kbd>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <Button
            type="button"
            loading={isLoading}
            sx={{ ml: 'auto' }}
            disabled={!values?.config?.phoneNumberId}
            onClick={() => {
              onSubmitSuccess?.();
            }}
          >
            Save
          </Button>
        </Stack>
      )}

      {/* <Typography level="title-lg" color="primary">
        Zendesk
      </Typography> */}
      {/* <FormControl>
        <FormLabel>Account Subdomain (required)</FormLabel>
        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
          <Typography color="neutral">https://</Typography>
          <Input
            control={methods.control}
            placeholder="Zendesk Subdomain"
            {...methods.register('config.domain')}
          />
          <Typography color="neutral">.zendesk.com</Typography>
        </Stack>
      </FormControl> */}

      {/* <Input
        control={methods.control}
        label="Email (required)"
        placeholder="email@company.com"
        helperText="Should be the same email you use to login to administer your Zendesk account."
        {...methods.register('config.email')}
      />

      <Input
        label="API Token (required)"
        control={methods.control}
        placeholder="Api Token"
        helperText="Found in Admin > Channels > API."
        {...methods.register('config.apiToken')}
      /> */}
    </Stack>
  );
}

export default IntegrationSettings;
