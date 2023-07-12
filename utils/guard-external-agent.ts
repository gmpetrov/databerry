import { Agent, AgentVisibility, UserApiKey } from '@prisma/client';

import { AgentInterfaceConfig } from '@app/types/models';

import { AgentWithTools } from './agent';
import { ApiError, ApiErrorType } from './api-error';

type Props = {
  agent: AgentWithTools & {
    owner: {
      apiKeys: UserApiKey[];
    };
  };
  hostname?: string;
  apiKey?: string;
};
const guardExternalAgent = ({ agent, apiKey, hostname }: Props) => {
  console.log('{ agent, apiKey, hostname }', { agent, apiKey, hostname });

  if (!agent) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const config = agent?.interfaceConfig as AgentInterfaceConfig;
  const authrorizedDomains = [
    ...(config?.authorizedDomains || []),
    // Include Chaindesk dashboard domain
    new URL(process.env.NEXT_PUBLIC_DASHBOARD_URL!).host,
  ];

  if (agent?.visibility === AgentVisibility.private) {
    if (
      !agent?.owner?.apiKeys.find((each) => each.key === apiKey) &&
      !authrorizedDomains.includes(hostname || '')
    )
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }
};

export default guardExternalAgent;
