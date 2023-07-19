import AddIcon from '@mui/icons-material/Add';
import { Alert } from '@mui/joy';
import Button from '@mui/joy/Button';
import { DatasourceType } from '@prisma/client';
import axios from 'axios';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import Input from '@app/components/Input';
import { UpsertDatasourceSchema } from '@app/types/models';
import logger from '@app/utils/logger';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const NotionSourceSchema = UpsertDatasourceSchema.extend({
    config: z.object({
        integrationKey: z.string().trim(),
      }),
});

function Nested() {
  const handleSignIn = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await axios.get('/api/integrations/notion/notion-auth');
    console.log(res.data)
    const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${res.data.client_id}&response_type=code`
    let code: string;
    window.open(url, 'authModal', 'width=800,height=800');
    const handleMessage = (event) => {
      if(!code){
        code = event.data;
        window.removeEventListener("message",handleMessage,true)
        notionAuth(code)
      }
    };
    window.addEventListener('message', handleMessage);
  };
  const notionAuth = async (code: string) => {
    const res = await axios.post('/api/integrations/notion/get-token',{code:code});
    console.log(res)
  }
  const { control, register } =
    useFormContext<z.infer<typeof NotionSourceSchema>>();

  return (
    <>
      <Input
        label="Notion Integration API key"
        control={control as any}
        placeholder="https://news.ycombinator.com"
        {...register('config.integrationKey')}
      />
      <Alert color="danger">
        All notebooks of workspaces for provided Notion integration will be processed.
      </Alert>
      <Button
        startDecorator={<AddIcon />}
        onClick={handleSignIn}
        variant={'plain'}
        sx={{ mr: 'auto' }}
      >
        Notion: Add Account
      </Button>
    </>
  );
}

export default function NotionForm(props: Props) {
  const { defaultValues, ...rest } = props;

  return (
    <Base
      schema={NotionSourceSchema}
      {...rest}
      defaultValues={{
        ...props.defaultValues!,
        type: DatasourceType.notion,
      }}
    >
      {!defaultValues?.id && <Nested />}
    </Base>
  );
}
