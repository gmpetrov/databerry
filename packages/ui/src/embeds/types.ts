import { SxProps } from '@mui/joy/styles/types';

import { CustomContact } from '@chaindesk/lib/types';
import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import { Agent } from '@chaindesk/prisma';

export type InitWidgetProps = {
  id?: string;
  initConfig?: AgentInterfaceConfig;
  agentId?: string;
  formId?: string;
  contact?: Omit<CustomContact, 'metadata'>;
  styles?: SxProps;
  context?: string;
  className?: string;
  onMarkedAsResolved?(): any;
  onAgentLoaded?: (agent: Agent) => any;
};
