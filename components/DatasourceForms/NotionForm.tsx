import AddIcon from '@mui/icons-material/Add';
import { Alert, RadioGroup } from '@mui/joy';
import Button from '@mui/joy/Button';
import Radio from '@mui/joy/Radio';
import { DatasourceType } from '@prisma/client';
import axios from 'axios';
import React, { ChangeEvent, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { UpsertDatasourceSchema } from '@app/types/models';

import Base from './Base';
import type { DatasourceFormProps } from './types';


type Props = DatasourceFormProps & {};

export const NotionSourceSchema = UpsertDatasourceSchema.extend({
  config: z.object({
    integrationKey: z.string().trim().default('internal'),
    notionIntegrationType: z.string().trim()
  })
  .refine(
    (data) => {
      if (data.integrationKey) {
        return !!z
          .string()
          .parse(data.integrationKey, {
            path: ['config.integrationKey'],
          });
      }
      return false;
    },
    {
      message: 'You must authentify for you notion workspace',
      path: ['config.integrationKey'],
    }
  ),
});
export const notionAuth = async (code: string) => {
  const res = await axios.post('/api/integrations/notion/get-token',{code:code});
  return res.data
}

function Nested() {
  
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSignIn(event)
  };

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if(e.target.value === "public"){
      const res = await axios.get('/api/integrations/notion/notion-auth');
      const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${res.data.client_id}&response_type=code`
      let code: string;
      window.open(url, 'authModal', 'width=800,height=800');
      const handleMessage = async(event) => {
        if(!code){
          code = event.data;
          window.removeEventListener("message",handleMessage,true)
          const tokenData = await notionAuth(code)
          setValue('config.integrationKey',tokenData.access_token)
        }
      };
      window.addEventListener('message', handleMessage);
    } else {
      setValue('config.integrationKey','internal')
    }
  };

  

  const { control, register,setValue } =
    useFormContext<z.infer<typeof NotionSourceSchema>>();

  return (
    <>
      <Alert color="danger">
        All notebooks of workspaces for provided Notion integration will be processed.
      </Alert>
      <RadioGroup defaultValue="internal" name="radio-buttons-group" sx={{ my: 1 }}>
        <Radio
          {...register('config.notionIntegrationType')}
          onChange={handleChange}
          value="public"
          label="Public ( Oauth2 authentication )"
        />
        <Radio
          {...register('config.notionIntegrationType')}
          onChange={handleChange}
          value="internal"
          label="Internal"
        />
      </RadioGroup>
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
