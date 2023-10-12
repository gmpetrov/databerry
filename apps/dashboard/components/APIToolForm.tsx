import { zodResolver } from '@hookform/resolvers/zod';
import { FormControl, FormLabel, Option, Select, Stack } from '@mui/joy';
import React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { HttpToolSchema } from '@chaindesk/lib/types/dtos';

import Input from './Input';

type Props = {};

function APIToolForm({}: Props) {
  const methods = useForm<HttpToolSchema>({
    // resolver: zodResolver(CreateAgentSchema),
    defaultValues: {},
  });

  return (
    <form
      onSubmit={methods.handleSubmit((data) => {
        console.log(data);
      })}
    >
      <Stack gap={2}>
        <Input
          control={methods.control}
          label={'Tool description'}
          {...methods.register('config.description')}
        />

        <Input
          control={methods.control}
          label={'URL to call'}
          {...methods.register('config.url')}
        />

        <FormControl>
          <FormLabel>Request Method</FormLabel>

          <Select>
            <Option value="get">GET</Option>
            <Option value="post">POST</Option>
            <Option value="put">PUT</Option>
            <Option value="patch">PATCH</Option>
            <Option value="delete">DELETE</Option>
          </Select>
        </FormControl>
      </Stack>
    </form>
  );
}

export default APIToolForm;
