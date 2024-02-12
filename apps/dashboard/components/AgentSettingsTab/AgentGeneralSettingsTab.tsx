import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import Link from 'next/link';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import toast from 'react-hot-toast';

import AgentForm from '@app/components/AgentForm';
import ModelInput from '@app/components/AgentInputs/ModelInput';
import SettingCard from '@app/components/ui/SettingCard';

import { RouteNames } from '@chaindesk/lib/types';
import { CreateAgentSchema } from '@chaindesk/lib/types/dtos';
import { Agent, AppDatasource as Datasource } from '@chaindesk/prisma';

import GeneralInput from '../AgentInputs/GeneralInput';
import ConnectForm from '../ConnectForm';

type Props = {
  defaultValues?: CreateAgentSchema;
  onSubmitSucces?: (agent: Agent) => any;
  agentId?: string;
};

export default function AgentGeneralSettingsTab(props: Props) {
  const { t } = useTranslation('chat');
  const handleDeleteAgent = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this agent? This action is irreversible.'
      )
    ) {
      await axios.delete(`/api/agents/${props.agentId}`);

      router.push(RouteNames.AGENTS);
    }
  };

  const deleteText = t('delete');

  return props.agentId ? (
    <Stack gap={4}>
      <AgentForm agentId={router.query.agentId as string}>
        {({ query, mutation }) => (
          <ConnectForm<CreateAgentSchema>>
            {({ formState }) => {
              return (
                <SettingCard
                  title="General Settings"
                  submitButtonProps={{
                    loading: mutation.isMutating,
                    disabled: !formState.isDirty || !formState.isValid,
                    children: `${t('save')}`,
                  }}
                >
                  <GeneralInput />
                </SettingCard>
              );
            }}
          </ConnectForm>
        )}
      </AgentForm>

      <SettingCard
        title="Agent ID"
        description={t('subtitle-id')}
        disableSubmitButton
      >
        <Stack spacing={2}>
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
                  {t('documatation')}
                </Button>
              </Link>
            }
          >
            {t('findOut')}
          </Alert>

          <Alert
            color="neutral"
            sx={{
              cursor: 'copy',
            }}
            onClick={() => {
              navigator.clipboard.writeText(props.agentId!);
              toast.success('Copied!', {
                position: 'bottom-center',
              });
            }}
          >
            {props.agentId}
          </Alert>
        </Stack>
      </SettingCard>

      <SettingCard
        title={t('delete-title')}
        description={t('delete-subtitle')}
        cardProps={{
          color: 'danger',
        }}
        submitButtonProps={{
          onClick: handleDeleteAgent,
          color: 'danger',
          children: deleteText,
          startDecorator: <DeleteIcon />,
        }}
      >
        <FormControl sx={{ gap: 1 }}>
          <Alert color="danger">{t('delete-msg')}</Alert>
        </FormControl>
      </SettingCard>
    </Stack>
  ) : null;
}
