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
import React, { useEffect } from 'react';

import useAgent from '@app/hooks/useAgent';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';

import AgentGeneralSettingsTab from './AgentGeneralSettingsTab';
import AgentModelSettingsTab from './AgentModelSettingsTab';
import AgentSecuritySettings from './AgentSecuritySettingsTab';
import AgentToolSettingsTab from './AgentToolSettingsTab';

type Props = {
  agentId: string;
};

function AgentSettingsTab(props: Props) {
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
      delete router.query.settingTab;
      router.replace(router, undefined, { shallow: true });
    }
  }, []);

  if (!agent) {
    return null;
  }

  return (
    <Stack direction="row" gap={4} sx={{ mt: -3, width: '100%' }}>
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
              onClick={() =>
                setState({
                  currentTab: 'general',
                })
              }
            >
              <ListItemDecorator>
                <SettingsRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>General</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={state.currentTab === 'model'}
              onClick={() =>
                setState({
                  currentTab: 'model',
                })
              }
            >
              <ListItemDecorator>
                <SmartToyRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>Model</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={state.currentTab === 'tools'}
              onClick={() =>
                setState({
                  currentTab: 'tools',
                })
              }
            >
              <ListItemDecorator>
                <SpokeRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>Tools</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={state.currentTab === 'security'}
              onClick={() =>
                setState({
                  currentTab: 'security',
                })
              }
            >
              <ListItemDecorator>
                <SecurityRoundedIcon />
              </ListItemDecorator>
              <ListItemContent>Security</ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Stack>

      <Stack sx={{ pt: 4, width: '100%', maxWidth: 'md', mx: 'auto' }}>
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
