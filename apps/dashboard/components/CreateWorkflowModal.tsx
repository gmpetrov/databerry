import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Divider,
  FormControl,
  Option,
  Sheet,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';
import FormHelperText from '@mui/joy/FormHelperText';
import FormLabel from '@mui/joy/FormLabel';
import Modal from '@mui/joy/Modal';
import Select from '@mui/joy/Select';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { getAgents } from '@app/pages/api/agents';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { createWorkflowSchema } from '@chaindesk/lib/types/dtos';
import { Prisma, WorkflowRecurrence } from '@chaindesk/prisma';

import CustomDatePicker from './DatePicker';
import Input from './Input';

export const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type Props = {
  isOpen: boolean;
  onClose(): any;
  submitCallback?(): void;
};

function CreateWorkflowModal({ isOpen, onClose, submitCallback }: Props) {
  const methods = useForm<createWorkflowSchema>({
    resolver: zodResolver(createWorkflowSchema),
    mode: 'onBlur',
  });

  const workflowMutation = useSWRMutation(
    `/api/workflows/create`,
    generateActionFetcher(HTTP_METHOD.POST)
  );

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  const createWorkflow = async (values: createWorkflowSchema) => {
    try {
      await workflowMutation.trigger({ ...values });
      submitCallback && submitCallback();
    } catch (err) {
      console.log('error', err);
    } finally {
      handleClose();
    }
  };

  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: 600,
          maxWidth: '100%',
          borderRadius: 'md',
          p: 3,
          boxShadow: 'lg',
          maxHeight: '100%',
          overflowY: 'auto',
        }}
      >
        <Typography level="title-md">Create A New Workflow</Typography>
        <Divider sx={{ my: 4 }} />
        <form onSubmit={methods.handleSubmit(createWorkflow)}>
          <Stack spacing={2}>
            <Input
              label="name"
              control={methods.control}
              {...methods.register('name')}
            />

            <Input
              label="description"
              control={methods.control}
              {...methods.register('description')}
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
              <Textarea {...methods.register('query')} minRows={2} />
              <FormHelperText>
                {methods.formState.errors?.query?.message}
              </FormHelperText>
            </FormControl>

            <Stack spacing={1}>
              <FormControl sx={{ mt: 2 }}>
                <FormLabel>Recurrence</FormLabel>
                <Select
                  onChange={(_, value) => {
                    if (value) {
                      methods.setValue(
                        'recurrence.type',
                        value as WorkflowRecurrence,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      );
                      methods.trigger();
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
                    onChange={(_, value) => {
                      if (value) {
                        methods.setValue(
                          'recurrence.config.dayOfMonth',
                          value as string,
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
              loading={workflowMutation.isMutating}
              sx={{ ml: 'auto', mt: 2 }}
              disabled={
                !methods.formState.isDirty || !methods.formState.isValid
              }
            >
              Create
            </Button>
          </Stack>
        </form>
      </Sheet>
    </Modal>
  );
}

export default CreateWorkflowModal;
