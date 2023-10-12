import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@chaindesk/ui/Input';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import axios, { AxiosError } from 'axios';
import { ServiceProviderZendeskSchema } from '@chaindesk/lib/types/dtos';
import { ApiErrorType } from '@chaindesk/lib/api-error';

type Props = {
  onSubmitSuccess?: any;
  agentId?: string;
};

const Schema = ServiceProviderZendeskSchema.pick({
  config: true,
});

type Schema = z.infer<typeof Schema>;

function IntegrationSettings({ onSubmitSuccess, agentId }: Props) {
  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {},
  });

  const onSubmit = async (values: Schema) => {
    try {
      await axios.post(
        `/api/integrations/zendesk/add?agentId=${agentId}`,
        values
      );
      onSubmitSuccess?.();
    } catch (err) {
      if (
        err instanceof AxiosError &&
        err?.response?.data?.error ===
          ApiErrorType.INTEGRATION_CREDENTIALS_INVALID
      ) {
        alert('Invalid credentials');
      } else {
        alert('Something went wrong');
        console.error(err);
      }
    }
  };

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={methods.handleSubmit(onSubmit)}
    >
      <Typography level="title-lg" color="primary">
        Zendesk
      </Typography>
      <FormControl>
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
      </FormControl>

      <Input
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
      />

      <Button type="submit" loading={methods.formState?.isSubmitting}>
        Save
      </Button>
    </Stack>
  );
}

export default IntegrationSettings;
