import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import router from 'next/router';
import React from 'react';

import AgentForm from '@app/components/AgentForm';
import ToolsInput from '@app/components/AgentInputs/ToolsInput';
import ConnectForm from '@app/components/ConnectForm';
import SettingCard from '@app/components/ui/SettingCard';

import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';
import { Agent, AppDatasource as Datasource } from '@chaindesk/prisma';

type Props = {
  defaultValues?: CreateAgentSchema;
  onSubmitSucces?: (agent: Agent) => any;
  agentId?: string;
};

export default function AgentToolSettingsTab(props: Props) {
  return props.agentId ? (
    <Stack gap={4}>
      <AgentForm agentId={router.query.agentId as string}>
        {({ query, mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ formState }) => (
              <SettingCard
                title="Tools"
                description="Give tools to your Agent to make it smarter"
                // submitButtonProps={{
                //   loading: mutation.isMutating,
                //   disabled: !formState.isDirty || !formState.isValid,
                //   children: 'Save',
                // }}
                disableSubmitButton
              >
                <ToolsInput />

                {formState.isDirty && formState.isValid && (
                  <Button
                    type="submit"
                    loading={mutation.isMutating}
                    sx={{
                      zIndex: 2,
                      ml: 'auto',
                      mt: 2,
                      position: 'fixed',
                      bottom: 20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      borderRadius: '30px',
                    }}
                    size="lg"
                    color="success"
                  >
                    Save
                  </Button>
                )}
              </SettingCard>
            )}
          </ConnectForm>
        )}
      </AgentForm>
      <AgentForm agentId={router.query.agentId as string}>
        {({ query, mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ formState, register, watch }) => {
              const includeSources = watch('includeSources');
              return (
                <SettingCard
                  title="Sources"
                  description="View content pulled from your Datastores to generate answers."
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    disabled: !formState.isDirty || !formState.isValid,
                    children: 'Save',
                  }}
                >
                  <Stack direction="row" mb={2}>
                    <FormControl className="flex flex-row space-x-4">
                      <Checkbox
                        {...register('includeSources')}
                        checked={!!includeSources}
                      />
                      <div className="flex flex-col">
                        <FormLabel>Include sources in Agent Answer</FormLabel>
                        <Typography level="body-xs">
                          When activated, your agent will include sources used
                          to generate the answer.
                        </Typography>
                      </div>
                    </FormControl>
                  </Stack>
                </SettingCard>
              );
            }}
          </ConnectForm>
        )}
      </AgentForm>
    </Stack>
  ) : null;
}
