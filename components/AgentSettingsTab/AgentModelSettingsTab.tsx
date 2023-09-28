import Stack from '@mui/joy/Stack';
import { Agent, AppDatasource as Datasource } from '@prisma/client';
import router from 'next/router';
import React from 'react';

import AgentForm from '@app/components/AgentForm';
import ModelInput from '@app/components/AgentInputs/ModelInput';
import ConnectForm from '@app/components/ConnectForm';
import SettingCard from '@app/components/ui/SettingCard';
import { CreateAgentSchema } from '@app/types/dtos';

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
            {({ formState }) => {
              return (
                <SettingCard
                  title="Language Model"
                  description="Customize the language model your Agent uses."
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    disabled: !formState.isDirty || !formState.isValid,
                    children: 'Save',
                  }}
                >
                  <ModelInput />
                </SettingCard>
              );
            }}
          </ConnectForm>
        )}
      </AgentForm>
    </Stack>
  ) : null;
}
