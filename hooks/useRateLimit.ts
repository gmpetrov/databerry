import type { Agent } from '@prisma/client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { AgentInterfaceConfig } from '@app/types/models';
import { fetcher } from '@app/utils/swr-fetcher';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

interface RateResponse {
  isRateExceeded: boolean;
  rateExceededMessage?: string;
}

const useRateLimit = ({ agentId }: { agentId: string }): RateResponse => {
  const [agentConfig, setAgentConfig] = useState<AgentInterfaceConfig>();
  useSWR<Agent>(`${API_URL}/api/agents/${agentId}`, fetcher, {
    onSuccess: (data) => {
      setAgentConfig(data?.interfaceConfig as AgentInterfaceConfig);
    },
  });

  useEffect(() => {
    if (!agentConfig?.rateLimitInterval) return;
    const interval = setInterval(() => {
      localStorage.setItem('rateLimitCount', '0');
    }, agentConfig?.rateLimitInterval * 1000);

    return () => clearInterval(interval);
  }, [agentConfig]);

  if (agentConfig?.rateLimit && agentConfig?.rateLimitInterval) {
    if (
      agentConfig.rateLimit <= Number(localStorage.getItem('rateLimitCount'))
    ) {
      return {
        isRateExceeded: true,
        rateExceededMessage:
          agentConfig.rateLimitMessage || 'Usage limit reached',
      };
    }
  }

  // keep the current behaviour if rateLimit or rateLimitInterval is not provided
  return {
    isRateExceeded: false,
  };
};

export default useRateLimit;
