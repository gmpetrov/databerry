import Stack from '@mui/joy/Stack';
import { Agent, AppDatasource as Datasource } from '@prisma/client';
import router from 'next/router';
import React from 'react';

import { CreateAgentSchema } from '@app/types/dtos';

import AgentForm from '../AgentForm';
import ToolsInput from '../AgentInputs/ToolsInput';
import ConnectForm from '../ConnectForm';
import SettingCard from '../ui/SettingCard';

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
                title="Datastore"
                description="The Datastore your Agent can access."
                submitButtonProps={{
                  loading: mutation.isMutating,
                  disabled: !formState.isDirty || !formState.isValid,
                  children: 'Save',
                }}
              >
                <ToolsInput />
              </SettingCard>
            )}
          </ConnectForm>
        )}
      </AgentForm>
    </Stack>
  ) : null;
}
