import { SubscriptionPlan, Usage } from '@prisma/client';

import accountConfig from './account-config';
import { ApiError, ApiErrorType } from './api-error';

const guardAgentQueryUsage = (props: {
  usage: Usage;
  plan: SubscriptionPlan;
}) => {
  if (
    props.usage?.nbAgentQueries >=
    accountConfig[props.plan]?.limits?.maxAgentsQueries
  ) {
    throw new ApiError(ApiErrorType.USAGE_LIMIT);
  }
};

export default guardAgentQueryUsage;
