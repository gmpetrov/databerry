import { Input, Textarea, Typography } from '@mui/joy';
import Button from '@mui/joy/Button';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { Divider } from '@mui/material';
import Link from 'next/link';
import React, { useState } from 'react';
import useSWR from 'swr';

import useStateReducer from '@app/hooks/useStateReducer';
import { getForms } from '@app/pages/api/forms';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { Form, Prisma } from '@chaindesk/prisma';

import Loader from '../Loader';
type Props = {
  saveFormTool: ({
    form,
    trigger,
    messageCountTrigger,
  }: {
    form: Form;
    trigger?: string;
    messageCountTrigger?: number;
  }) => any;
};

function FormToolInput({ saveFormTool }: Props) {
  const getFormsQuery = useSWR<Prisma.PromiseReturnType<typeof getForms>>(
    '/api/forms?published=true',
    fetcher
  );
  // when should the form be triggered.
  const [state, setState] = useStateReducer({
    form: undefined as Form | undefined,
    trigger: undefined as string | undefined,
    messageCountTrigger: undefined as number | undefined,
  });

  if (!getFormsQuery.data && getFormsQuery.isLoading) {
    return <Loader />;
  }

  return (
    <Stack gap={3}>
      <Stack>
        <Typography level="body-md">
          Connect a form or{' '}
          <Link className="underline text-purple-300" href={RouteNames.FORMS}>
            create a new one
          </Link>
        </Typography>
        <Select
          onChange={(_, val) => {
            if (val) {
              setState({ form: val as Form });
            }
          }}
        >
          {getFormsQuery.data?.map((form) => (
            <Option key={form.id} value={form}>
              {form.name}
            </Option>
          ))}
        </Select>
      </Stack>
      <Divider />
      <Stack gap={1}>
        <Stack>
          <Typography level="body-sm">
            Trigger form after a specified number of messages:
          </Typography>
          <Input
            type="number"
            onChange={(e) =>
              setState({ messageCountTrigger: parseInt(e.target.value, 10) })
            }
          />
        </Stack>
        <Stack>
          <Typography level="body-sm">
            Alternatively, Describe when should the user be prompted with the
            form :
          </Typography>
          <Textarea
            minRows={3}
            onChange={(e) => setState({ trigger: e.target.value })}
          />
        </Stack>
      </Stack>
      <Button
        variant="soft"
        color="primary"
        sx={{ marginLeft: 'auto' }}
        disabled={!state.form || (!state.trigger && !state.messageCountTrigger)}
        onClick={() =>
          saveFormTool({
            form: state.form!,
            trigger: state.trigger,
            messageCountTrigger: state.messageCountTrigger,
          })
        }
      >
        Add Tool
      </Button>
    </Stack>
  );
}

export default FormToolInput;
