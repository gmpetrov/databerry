import type { Agent } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { AgentInterfaceConfig } from '@app/types/models';
import { fetcher } from '@app/utils/swr-fetcher';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;

interface RateResponse {
  isRateExceeded: boolean;
  rateExceededMessage?: string;
  handleIncrementRateLimitCount: () => any;
}

const useRateLimit = ({ agentId }: { agentId?: string }): RateResponse => {
  const [isRateExceeded, setIsRateExceeded] = useState(false);

  const getAgentQuery = useSWR<Agent>(
    agentId ? `${API_URL}/api/agents/${agentId}` : null,
    fetcher
  );

  const config = getAgentQuery?.data?.interfaceConfig as AgentInterfaceConfig;
  const rateLimit = config?.rateLimit?.maxQueries || 0;

  const handleIncrementRateLimitCount = useCallback(() => {
    let currentRateCount = Number(localStorage.getItem('rateLimitCount')) || 0;
    localStorage.setItem('rateLimitCount', `${++currentRateCount}`);

    if (currentRateCount >= rateLimit) {
      setIsRateExceeded(true);
    }
  }, [rateLimit]);

  useEffect(() => {
    if (!config?.rateLimit?.interval) return;

    const interval = setInterval(() => {
      localStorage.setItem('rateLimitCount', '0');
      setIsRateExceeded(false);
    }, config?.rateLimit?.interval * 1000);

    return () => clearInterval(interval);
  }, [config]);

  return {
    isRateExceeded: config?.rateLimit?.enabled ? isRateExceeded : false,
    handleIncrementRateLimitCount,
    rateExceededMessage:
      config?.rateLimit?.limitReachedMessage || 'Usage limit reached',
  };
};

export default useRateLimit;
