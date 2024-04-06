import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/joy/Typography';
import router from 'next/router';
import React from 'react';

import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';
import {
  Agent,
  AgentVisibility,
  AppDatasource as Datasource,
} from '@chaindesk/prisma';
import Input from '@chaindesk/ui/Input';

import AgentForm from '../AgentForm';
import ConnectForm from '../ConnectForm';
import SettingCard from '../ui/SettingCard';

type Props = {
  defaultValues?: CreateAgentSchema;
  onSubmitSucces?: (agent: Agent) => any;
  agentId?: string;
};

export default function AgentSecuritySettings(props: Props) {
  return props.agentId ? (
    <Stack gap={4}>
      <AgentForm agentId={router.query.agentId as string}>
        {({ query, mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ register, watch, formState, setValue }) => {
              const visibility = watch('visibility');

              return (
                <SettingCard
                  title="Agent Access"
                  //   description="Enable this if you want to use  "
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    disabled: !formState.isDirty || !formState.isValid,
                    children: 'Save',
                  }}
                >
                  <div className="flex flex-row">
                    <FormControl className="flex flex-row space-x-4">
                      <Checkbox
                        checked={visibility === AgentVisibility.public}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue('visibility', AgentVisibility.public, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          } else {
                            setValue('visibility', AgentVisibility.private, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                      <div className="flex flex-col">
                        <FormLabel>Public</FormLabel>
                        <Typography level="body-xs">
                          When activated, your agent will be available without
                          an API Key.
                        </Typography>
                      </div>
                    </FormControl>
                  </div>
                </SettingCard>
              );
            }}
          </ConnectForm>
        )}
      </AgentForm>
      <AgentForm agentId={router.query.agentId as string}>
        {({ query, mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ register, watch, formState, setValue }) => {
              const config = watch('interfaceConfig');

              return (
                <SettingCard
                  title="Authorized Domains"
                  description="Restrict the chat widget to specific domains for security purposes. e.g: example.com"
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    disabled: !formState.isDirty || !formState.isValid,
                    children: 'Save',
                  }}
                >
                  <Textarea
                    placeholder={`example-1.com\nexample-2.com`}
                    minRows={3}
                    defaultValue={config?.authorizedDomains?.join('\n')}
                    onChange={(e) => {
                      //   e.stopPropagation();

                      try {
                        const str = e.target.value;

                        const values = str.split('\n');
                        const domains = values
                          .map((each) =>
                            each.trim()?.replace(/https?:\/\//, '')
                          )
                          .filter((each) => !!each)
                          .map((each) => {
                            let hostname = '';
                            try {
                              hostname = new URL(`http://${each}`).host;
                            } catch (err) {}

                            return hostname;
                          })
                          .filter((each) => each !== undefined);

                        setValue('interfaceConfig.authorizedDomains', domains, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      } catch (err) {
                        console.log('err', err);
                      }
                    }}
                  />
                </SettingCard>
              );
            }}
          </ConnectForm>
        )}
      </AgentForm>
      <AgentForm agentId={router.query.agentId as string}>
        {({ query, mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ register, watch, formState, setValue, control }) => {
              const isRateLimitEnabled = watch(
                'interfaceConfig.rateLimit.enabled'
              );

              return (
                <SettingCard
                  title="Rate Limit"
                  description="Use rate limiting to prevent abuse of your agent."
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    disabled: !formState.isDirty || !formState.isValid,
                    children: 'Save',
                  }}
                >
                  <div className="flex space-x-4">
                    <Checkbox
                      size="lg"
                      {...register('interfaceConfig.rateLimit.enabled')}
                      onChange={() => {
                        setValue(
                          'interfaceConfig.rateLimit.enabled',
                          !isRateLimitEnabled,
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          }
                        );
                      }}
                      checked={!!isRateLimitEnabled}
                    />

                    <div className="flex flex-col">
                      <FormLabel>Enable Rate Limit</FormLabel>
                      <Typography level="body-xs">
                        X messages max every Y seconds
                      </Typography>
                    </div>
                  </div>

                  <Stack gap={2} pl={4}>
                    <Input
                      control={control}
                      label="Max number of queries"
                      disabled={!isRateLimitEnabled}
                      placeholder="10"
                      {...register('interfaceConfig.rateLimit.maxQueries')}
                    />
                    <Input
                      control={control}
                      label="Interval (in seconds)"
                      disabled={!isRateLimitEnabled}
                      placeholder="60"
                      {...register('interfaceConfig.rateLimit.interval')}
                    />
                    <Input
                      control={control}
                      label="Rate Limit Reached Message"
                      placeholder="Usage limit reached"
                      disabled={!isRateLimitEnabled}
                      {...register(
                        'interfaceConfig.rateLimit.limitReachedMessage'
                      )}
                    />
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
