import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import SpokeRoundedIcon from '@mui/icons-material/SpokeRounded';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Stack,
} from '@mui/joy';
import axios from 'axios';
import router, { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';

import useAgent from '@app/hooks/useAgent';
import useStateReducer from '@app/hooks/useStateReducer';

import { RouteNames } from '@chaindesk/lib/types';

import AgentGeneralSettingsTab from './AgentGeneralSettingsTab';
import AgentModelSettingsTab from './AgentModelSettingsTab';
import AgentSecuritySettings from './AgentSecuritySettingsTab';
import AgentToolSettingsTab from './AgentToolSettingsTab';

type Props = {
  agentId: string;
};

function AgentSettingsTab(props: Props) {
  const { t } = useTranslation('chat');
  const router = useRouter();
  const [state, setState] = useStateReducer({
    currentTab: (router?.query?.settingTab as string) || 'general',
  });

  const { query } = useAgent({
    id: props.agentId as string,
  });

  const agent = query?.data;

  useEffect(() => {
    if (router.query.settingTab) {
      setState({
        currentTab: router.query.settingTab as string,
      });
    }
  }, [router.query.settingTab]);

  const handleChangeTab = (tab: string) => {
    router.query.settingTab = tab;
    router.replace(router, undefined, { shallow: true });
  };

  if (!agent) {
    return null;
  }

  return (
    <Stack direction="row" gap={4} sx={{ width: '100%', height: '100%' }}>
      <Stack
        sx={{
          px: 2,
          pt: 2,
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <List
          size="sm"
          sx={{
            '--ListItem-radius': '6px',
            '--List-gap': '6px',
            minWidth: '120px',
          }}
        >
          <ListItem>
            <ListItemButton
              selected={state.currentTab === 'general'}
              onClick={() => handleChangeTab('general')}
            >
              <ListItemDecorator>
                <SettingsRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>{t('allg')}</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={state.currentTab === 'model'}
              onClick={() => handleChangeTab('model')}
            >
              <ListItemDecorator>
                <SmartToyRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>{t('ki')}</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={state.currentTab === 'tools'}
              onClick={() => handleChangeTab('tools')}
            >
              <ListItemDecorator>
                <SpokeRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>{t('tool')}</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={state.currentTab === 'security'}
              onClick={() => handleChangeTab('security')}
            >
              <ListItemDecorator>
                <SecurityRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>{t('secur')}</ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Stack>

      <Stack
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          maxWidwth: 'md',
          mx: 'auto',
          py: 4,
        }}
      >
        {state.currentTab === 'general' && (
          <AgentGeneralSettingsTab agentId={props.agentId} />
        )}
        {state.currentTab === 'model' && (
          <AgentModelSettingsTab agentId={props.agentId} />
        )}

        {state.currentTab === 'tools' && (
          <AgentToolSettingsTab agentId={props.agentId} />
        )}

        {state.currentTab === 'security' && (
          <AgentSecuritySettings agentId={props.agentId} />
        )}
      </Stack>
    </Stack>
  );
}

export default AgentSettingsTab;
