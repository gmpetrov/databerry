import { SubscriptionPlan, Usage } from '@prisma/client';

import accountConfig from './account-config';
import { ApiError, ApiErrorType } from './api-error';

const guardDataProcessingUsage = (props: {
  usage: Usage;
  plan: SubscriptionPlan;
}) => {
  if (
    props.usage?.nbDataProcessingBytes >=
    accountConfig[props.plan]?.limits?.maxDataProcessing
  ) {
    throw new ApiError(ApiErrorType.USAGE_LIMIT);
  }
};

export default guardDataProcessingUsage;
