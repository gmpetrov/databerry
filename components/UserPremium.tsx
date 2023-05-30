import { SubscriptionPlan } from '@prisma/client';
import { useSession } from 'next-auth/react';
import React from 'react';

import accountConfig from '@app/utils/account-config';

type Props = {
  children?: any;
};

function UserPremium(props: Props) {
  const { data: session, status } = useSession();

  const currentPlan = accountConfig[session?.user?.currentPlan!];

  if (currentPlan?.type === SubscriptionPlan?.level_0) {
    return null;
  }

  return props.children;
}

export default UserPremium;
