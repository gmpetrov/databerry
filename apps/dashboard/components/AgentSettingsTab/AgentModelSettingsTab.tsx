import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import AgentForm from '@app/components/AgentForm';
import ModelInput from '@app/components/AgentInputs/ModelInput';
import ConnectForm from '@app/components/ConnectForm';
import SettingCard from '@app/components/ui/SettingCard';

import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';
import { Agent, AppDatasource as Datasource } from '@chaindesk/prisma';

import Motion from '../Motion';
import MotionBottom from '../MotionBottom';

type Props = {
  defaultValues?: CreateAgentSchema;
  onSubmitSucces?: (agent: Agent) => any;
  agentId?: string;
};

export default function AgentToolSettingsTab(props: Props) {
  const { t } = useTranslation('chat');
  return props.agentId ? (
    <Stack gap={4}>
      <AgentForm agentId={router.query.agentId as string}>
        {({ query, mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ formState }) => {
              return (
                <SettingCard
                  title={t('ki-title')}
                  description={t('ki-subtitle')}
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    disabled: !formState.isDirty || !formState.isValid,
                    children: `${t('save')}`,
                  }}
                >
                  <ModelInput />

                  {formState.isDirty && formState.isValid && (
                    <MotionBottom>
                      {({ ref }: any) => (
                        <Button
                          ref={ref as any}
                          type="submit"
                          disabled={!formState.isDirty}
                          loading={mutation.isMutating}
                          color="success"
                          sx={{
                            position: 'fixed',
                            bottom: 35,
                            right: 90,
                            zIndex: 1,
                          }}
                          startDecorator={<SaveRoundedIcon />}
                        >
                          {t('save')}
                        </Button>
                      )}
                    </MotionBottom>
                  )}
                </SettingCard>
              );
            }}
          </ConnectForm>
        )}
      </AgentForm>
    </Stack>
  ) : null;
}
