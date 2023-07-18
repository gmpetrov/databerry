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
import { NotionAuthManager } from '@app/utils/loaders/notion-manager';

import Base from './Base';
import type { DatasourceFormProps } from './types';

type Props = DatasourceFormProps & {};

export const NotionSourceSchema = UpsertDatasourceSchema.extend({
    config: z.object({
        integrationKey: z.string().trim(),
      }),
});

// const params = {
//   client_id: process.env.NOTION_CLIENT_ID,
//   response_type: "code",
//   owner: "user"
// }




function Nested() {
  const handleSignIn = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await axios.get('/api/integrations/notion/notion-auth');
    const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${res.data}&response_type=code`
    window.open(url, 'authModal', 'width=800,height=800');
    const doc = document.querySelector(
      "a[target='authModal']",
    );
    const query = window.location.href
    console.log(query)
  };
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
