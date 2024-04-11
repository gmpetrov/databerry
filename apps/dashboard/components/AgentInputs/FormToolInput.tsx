import { Input, Textarea, Typography } from '@mui/joy';
import Button from '@mui/joy/Button';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import { Divider } from '@mui/material';
import Link from 'next/link';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import useSWR from 'swr';

import { getForms } from '@app/pages/api/forms';
import { getForm } from '@app/pages/api/forms/[formId]';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateAgentSchema, HttpToolSchema } from '@chaindesk/lib/types/dtos';
import { Form, Prisma } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import Loader from '@chaindesk/ui/Loader';
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

export function NewFormToolInput({ saveFormTool }: Props) {
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
    <Stack
      gap={3}
      component="form"
      onSubmit={() => {
        saveFormTool({
          form: state.form!,
          trigger: state.trigger,
          messageCountTrigger: state.messageCountTrigger,
        });
      }}
    >
      <Stack>
        <Typography level="body-md">
          Connect a form or{' '}
          <Link className="text-purple-300 underline" href={RouteNames.FORMS}>
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
            Describe when should the user be prompted with the form:
          </Typography>
          <Textarea
            placeholder="Use when the user wants to report a bug"
            minRows={3}
            onChange={(e) => setState({ trigger: e.target.value })}
          />
        </Stack>
        <Stack>
          <Typography level="body-sm">
            Alternatively, Trigger form after a specified number of messages:
          </Typography>
          <Input
            type="number"
            onChange={(e) =>
              setState({ messageCountTrigger: parseInt(e.target.value, 10) })
            }
          />
        </Stack>
      </Stack>
      <Button
        type="submit"
        variant="soft"
        color="primary"
        sx={{ marginLeft: 'auto' }}
        disabled={!state.form || (!state.trigger && !state.messageCountTrigger)}
      >
        Add Tool
      </Button>
    </Stack>
  );
}

export function EditFormToolInput({
  currentToolIndex,
  onSubmit,
}: {
  currentToolIndex: number;
  onSubmit(): any;
}) {
  const { getValues, register, setValue } = useFormContext<
    HttpToolSchema | CreateAgentSchema
  >();

  const { messageCountTrigger, trigger } = getValues(
    `tools.${currentToolIndex}.config`
  );

  return (
    <Stack gap={1} component="form" onSubmit={onSubmit}>
      <Stack>
        <Typography level="body-sm">
          Describe when should the user be prompted with the form:
        </Typography>
        <Textarea
          placeholder="Use when the user wants to report a bug"
          minRows={3}
          defaultValue={trigger}
          {...register(`tools.${currentToolIndex}.config.trigger`)}
        />
      </Stack>
      <Stack>
        <Typography level="body-sm">
          Alternatively, Trigger form after a specified number of messages:
        </Typography>
        <Input
          type="number"
          defaultValue={messageCountTrigger}
          {...register(`tools.${currentToolIndex}.config.messageCountTrigger`)}
        />
      </Stack>
      <Button type="submit" sx={{ ml: 'auto' }}>
        Update
      </Button>
    </Stack>
  );
}
