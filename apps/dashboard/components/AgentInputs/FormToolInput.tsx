import Button from '@mui/joy/Button';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Link from 'next/link';
import React from 'react';
import useSWR from 'swr';

import { getForms } from '@app/pages/api/forms';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { Agent, AgentModelName, Form, Prisma } from '@chaindesk/prisma';

import Loader from '../Loader';
type Props = {
  onChange: (form: Form) => any;
};

function FormToolInput({ onChange }: Props) {
  const getFormsQuery = useSWR<Prisma.PromiseReturnType<typeof getForms>>(
    '/api/forms?published=true',
    fetcher
  );

  if (!getFormsQuery.data && getFormsQuery.isLoading) {
    return <Loader />;
  }

  return (
    <Stack gap={2}>
      <Select
        onChange={(_, val) => {
          if (val) {
            onChange?.(val as Form);
          }
        }}
      >
        {getFormsQuery.data?.map((form) => (
          <Option key={form.id} value={form}>
            {form.name}
          </Option>
        ))}
      </Select>

      <Link href={RouteNames.FORMS} style={{ marginLeft: 'auto' }}>
        <Button sx={{ ml: 'auto' }} variant="plain">
          Create Form
        </Button>
      </Link>
    </Stack>
  );
}

export default FormToolInput;
