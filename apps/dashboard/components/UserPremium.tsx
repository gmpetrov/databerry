import { useSession } from 'next-auth/react';
import React from 'react';

import accountConfig from '@chaindesk/lib/account-config';
import { SubscriptionPlan } from '@chaindesk/prisma';

type Props = {
  children?: any;
};

function UserPremium(props: Props) {
  const { data: session, status } = useSession();

  const currentPlan = accountConfig[session?.organization?.currentPlan!];

  if (currentPlan?.type === SubscriptionPlan?.level_0) {
    return null;
  }

  return props.children;
}

export default UserPremium;
