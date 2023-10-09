import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import router from 'next/router';
import React from 'react';

import AgentForm from '@app/components/AgentForm';
import ConnectForm from '@app/components/ConnectForm';
import SettingCard from '@app/components/ui/SettingCard';

import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';

export default function AgentLeadSettingsTab({ agentId }: { agentId: string }) {
  return agentId ? (
    <Stack gap={4}>
      <AgentForm agentId={router.query.agentId as string}>
        {({ mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ register, watch, setValue, trigger }) => {
              const isLeadCaptureEnabled = watch(
                'interfaceConfig.isLeadCaptureEnabled'
              );
              if (
                isLeadCaptureEnabled === undefined ||
                isLeadCaptureEnabled === null
              ) {
                setValue('interfaceConfig.isLeadCaptureEnabled', true);
              }
              return (
                <SettingCard
                  title="Leads"
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    children: 'Save',
                  }}
                >
                  <Stack direction="row" mb={2}>
                    <FormControl className="flex flex-row space-x-4">
                      <Checkbox
                        {...register('interfaceConfig.isLeadCaptureEnabled')}
                        checked={isLeadCaptureEnabled ?? true}
                        onChange={() => {
                          setValue(
                            'interfaceConfig.isLeadCaptureEnabled',
                            !Boolean(isLeadCaptureEnabled)
                          );
                          trigger();
                        }}
                      />
                      <div className="flex flex-col">
                        <FormLabel>Capture user emails</FormLabel>
                        <Typography level="body-xs">
                          When activated, your agent will be able to get users
                          emails.
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
