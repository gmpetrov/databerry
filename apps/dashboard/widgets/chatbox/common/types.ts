import { SxProps } from '@mui/joy/styles/types';

import { CustomContact } from '@app/hooks/useChat';

import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';

export type InitWidgetProps = {
  agentId?: string;
  onMarkedAsResolved?(): any;
  contact?: CustomContact;
  initConfig: AgentInterfaceConfig;
  styles?: SxProps;
  context?: string;
  initialMessages?: string[];
};
