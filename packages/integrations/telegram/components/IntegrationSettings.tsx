import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@chaindesk/ui/Input';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import toast from 'react-hot-toast';
import LinkButton from '@chaindesk/ui/LinkButton';
import axios from 'axios';
import Markdown from '@chaindesk/ui/Markdown';
import { AddServiceProviderTelegramSchema } from '@chaindesk/lib/types/dtos';

import cuid from 'cuid';

type Props = {
  onSubmitSuccess?: any;
  agentId?: string;
};

function IntegrationSettings({ onSubmitSuccess, agentId }: Props) {
  const [loading, setLoading] = useState(false);
  const methods = useForm<AddServiceProviderTelegramSchema>({
    resolver: zodResolver(AddServiceProviderTelegramSchema),
    defaultValues: {
      type: 'telegram',
      agentId: agentId,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: AddServiceProviderTelegramSchema) => {
    try {
      setLoading(true);
      const secret_key = cuid();
      const { data: response } = await axios.post(
        `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/tools/http-tool/validator`,
        {
          url: `https://api.telegram.org/bot${values.config.http_token}/getMe`,
          method: 'POST',
          drop_pending_updates: true,
        }
      );
      const { id: bot_id, username: bot_name } = response.data.result;

      const { data } = await axios.post(`/api/integrations/telegram/add`, {
        http_token: values.config.http_token,
        secret_key,
        bot_name,
        bot_id,
        agentId,
      });
      if (data.status !== 200) {
        toast.error(data.message, {
          duration: 5000,
        });
        return;
      }
      toast.success('Your new telegram integration is live!', {
        duration: 4000,
      });
      onSubmitSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={methods.handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        ['kbd']: {
          fontSize: '1rem',
          fontFamily: 'Josefin Sans',
        },
      }}
    >
      <Stack gap={2}>
        <Markdown>
          {`
### Instructions
1. [Create a Telegram bot](https://docs.chaindesk.ai/integrations/telegram)
2. Get yout bot HTTP token
3. (optional) Add your bot to a Telegram channel
        `}
        </Markdown>
        {/* <LinkButton
          linkProps={{
            // Todo: make similar tuto type as make.
            href: 'https://www.youtube.com/watch?v=ePQQWw-Xo14',
            target: '_blank',
          }}
          buttonProps={{
            size: 'sm',
            color: 'primary',
            variant: 'soft',
          }}
        >
          Quick tutorial
        </LinkButton> */}
      </Stack>
      <Input
        control={methods.control}
        label="Telegram Bot HTTP token"
        {...methods.register('config.http_token')}
      />
      <Button
        type="submit"
        disabled={!methods.formState.isValid}
        loading={loading}
      >
        Create
      </Button>
    </Stack>
  );
}

export default IntegrationSettings;
