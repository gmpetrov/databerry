import { SubscriptionPlan } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React from 'react';

import accountConfig from '@app/utils/account-config';

type Props = {
  children?: any;
};

function UserFree(props: Props) {
  const { data: session, status } = useSession();

  const currentPlan = accountConfig[session?.organization?.currentPlan!];

  if (currentPlan?.type !== SubscriptionPlan?.level_0) {
    return null;
  }

  return props.children;
}

export default UserFree;
