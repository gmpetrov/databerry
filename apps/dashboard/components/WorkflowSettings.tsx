import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { Option, Select } from '@mui/joy';
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { getAgents } from '@app/pages/api/agents';
import { getWorkflow } from '@app/pages/api/workflows/[id]';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { updateWorkflowSchema } from '@chaindesk/lib/types/dtos';
import { Prisma, WorkflowRecurrence } from '@chaindesk/prisma';

import { weekDays } from './CreateWorkflowModal';
import CustomDatePicker from './DatePicker';
import Input from './Input';
type Props = {
  workflowId: string;
};

function WorkflowSettings({ workflowId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  const getWorkflowQuery = useSWR<Prisma.PromiseReturnType<typeof getWorkflow>>(
    `/api/workflows/${workflowId}`,
    fetcher
  );
  const methods = useForm<updateWorkflowSchema>({
    resolver: zodResolver(updateWorkflowSchema),
    mode: 'onBlur',
    ...(getWorkflowQuery.data
      ? {
          defaultValues: {
            ...getWorkflowQuery.data,
            recurrence: {
              type: getWorkflowQuery.data?.recurrence,
              config: getWorkflowQuery.data?.recurrenceConfig,
            },
          } as any,
        }
      : {}),
  });

  console.log(
    'these are the default : ----------------->',
    methods.formState.defaultValues
  );

  const updateWorkflowMutation = useSWRMutation(
    `/api/workflows/${workflowId}`,
    generateActionFetcher(HTTP_METHOD.PATCH)
  );

  const updateWorkflow = async (values: updateWorkflowSchema) => {
    await updateWorkflowMutation.trigger({ ...values });
  };

  const handleDeleteWorkflow = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this workflow? This action is irreversible.'
      )
    ) {
      try {
        setIsDeleting(true);

        await axios.delete(`/api/workflows/${workflowId}`);

        router.push(RouteNames.WORKFLOWS);
      } catch (err) {
        console.log(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!getWorkflowQuery?.data?.id) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        maxWidth: '100%',
        width: theme.breakpoints.values.md,
        mx: 'auto',
      })}
    >
      <Divider sx={{ my: 4 }} />
      <Stack spacing={2}>
        <FormLabel>Workflow ID</FormLabel>

        <Alert
          color="neutral"
          sx={{
            cursor: 'copy',
          }}
          onClick={() => {
            navigator.clipboard.writeText(getWorkflowQuery?.data?.id!);
            toast.success('Copied!', {
              position: 'bottom-center',
            });
          }}
        >
          {getWorkflowQuery?.data?.id}
        </Alert>

        <Alert
          color="neutral"
          startDecorator={<HelpOutlineRoundedIcon />}
          endDecorator={
            <Link href="https://docs.chaindesk.ai" target="_blank">
              <Button
                variant="plain"
                size="sm"
                endDecorator={<ArrowForwardRoundedIcon />}
              >
                Documentation
              </Button>
            </Link>
          }
        >
          Learn more about the Datatberry API
        </Alert>
      </Stack>

      <Divider sx={{ my: 2 }} />
      <form onSubmit={methods.handleSubmit(updateWorkflow)}>
        <Stack spacing={2}>
          <Input
            label="name"
            control={methods.control}
            {...methods.register('name')}
            defaultValue={methods.formState.defaultValues?.name}
          />

          <Input
            label="description"
            control={methods.control}
            {...methods.register('description')}
            defaultValue={methods.formState.defaultValues?.description}
          />

          <FormControl error={!!methods.formState.errors?.agentId?.message}>
            <FormLabel>Agent</FormLabel>
            <Select
              onChange={(_, value) => {
                if (value) {
                  methods.setValue('agentId', value as string, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
              defaultValue={methods.formState.defaultValues?.agentId}
            >
              {getAgentsQuery.data?.map((agent) => (
                <Option value={agent.id} key={agent.id}>
                  {agent.name}
                </Option>
              ))}
            </Select>
            <FormHelperText>
              {methods.formState.errors?.agentId?.message}
            </FormHelperText>
          </FormControl>

          <FormControl error={!!methods.formState.errors?.query?.message}>
            <FormLabel>Workflow Query</FormLabel>
            <Textarea
              {...methods.register('query')}
              minRows={2}
              defaultValue={methods.formState.defaultValues?.query}
            />
            <FormHelperText>
              {methods.formState.errors?.query?.message}
            </FormHelperText>
          </FormControl>
          <Stack spacing={1}>
            <FormControl sx={{ mt: 2 }}>
              <FormLabel>Recurrence</FormLabel>
              <Select
                defaultValue={methods.formState.defaultValues?.recurrence?.type}
                onChange={(_, value) => {
                  if (value) {
                    methods.setValue('recurrence.type', value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
              >
                {['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'NO_REPEAT']?.map(
                  (recurence, i) => (
                    <Option value={recurence} key={i}>
                      {recurence}
                    </Option>
                  )
                )}
              </Select>
              <FormHelperText>
                {methods.formState.errors?.recurrence?.message}
              </FormHelperText>
            </FormControl>

            {methods.getValues('recurrence.type') === 'WEEKLY' && (
              <FormControl sx={{ mt: 2 }}>
                <FormLabel>Repeats every:</FormLabel>
                <Select
                  defaultValue={
                    (methods.formState.defaultValues?.recurrence?.config as any)
                      .dayOfWeek
                  }
                  onChange={(_, value) => {
                    if (value) {
                      methods.setValue(
                        'recurrence.config.dayOfWeek',
                        value as string,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      );
                    }
                  }}
                >
                  {weekDays?.map((day, i) => (
                    <Option value={day} key={i}>
                      {day}
                    </Option>
                  ))}
                </Select>
                <FormHelperText>
                  {methods.formState.errors?.recurrence?.message}
                </FormHelperText>
              </FormControl>
            )}

            {methods.getValues('recurrence.type') === 'MONTHLY' && (
              <FormControl sx={{ mt: 2 }}>
                <FormLabel>Repeats every:</FormLabel>
                <Select
                  defaultValue={
                    (methods.formState.defaultValues?.recurrence?.config as any)
                      .dayOfMonth
                  }
                  onChange={(_, value) => {
                    if (value) {
                      methods.setValue(
                        'recurrence.config.dayOfMonth',
                        value as any,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      );
                    }
                  }}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1)?.map(
                    (day, i) => (
                      <Option value={day} key={i}>
                        Day {day}
                      </Option>
                    )
                  )}
                  <Option value={'last_day'}>Last day</Option>
                </Select>
                <FormHelperText>
                  {methods.formState.errors?.recurrence?.message}
                </FormHelperText>
              </FormControl>
            )}
            {methods.getValues('recurrence.type') === 'NO_REPEAT' && (
              <>
                <CustomDatePicker
                  defaultValue={
                    (methods.formState.defaultValues?.recurrence?.config as any)
                      .date
                  }
                  type="date"
                  onChange={(e) => {
                    methods.setValue(
                      'recurrence.config.date',
                      dayjs(e).format('YYYY/MM/DD'),
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    );
                  }}
                />
              </>
            )}
            {methods.getValues('recurrence') &&
              methods.getValues('recurrence.type') !== 'HOURLY' && (
                <Stack direction="column">
                  <Typography>At:</Typography>
                  <CustomDatePicker
                    defaultValue={
                      (
                        methods.formState.defaultValues?.recurrence
                          ?.config as any
                      )?.hour
                    }
                    type="time"
                    views={['hours']}
                    onChange={(hour: number) => {
                      methods.setValue('recurrence.config.hour', hour, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                </Stack>
              )}
          </Stack>
        </Stack>
        <Stack width="100%" direction="row-reverse">
          <Button
            type="submit"
            loading={updateWorkflowMutation.isMutating}
            sx={{ ml: 'auto', mt: 2 }}
            disabled={!methods.formState.isDirty || !methods.formState.isValid}
          >
            Update
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 4 }} />

      <FormControl sx={{ gap: 1 }}>
        <FormLabel>Delete Workflow</FormLabel>
        <Typography level="body-xs">
          It will delete the workflow and all the associated jobs.
        </Typography>
        <Button
          color="danger"
          sx={{ mr: 'auto', mt: 2 }}
          startDecorator={<DeleteIcon />}
          onClick={handleDeleteWorkflow}
          loading={isDeleting}
        >
          Delete
        </Button>
      </FormControl>
    </Box>
  );
}

export default WorkflowSettings;
