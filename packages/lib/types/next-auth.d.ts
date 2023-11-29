import NextAuth, { DefaultSession } from 'next-auth';

import type {
  GlobalRole,
  Membership,
  Organization,
  Subscription,
  SubscriptionPlan,
  Usage,
} from '@chaindesk/prisma';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    authType?: 'apiKey' | 'session';
    roles: (GlobalRole | MembershipRole)[];
    organization: Organization & {
      usage: Usage;

      subscriptions?: Subscription[];
      isPremium: boolean;
      customerId: string;
      currentPlan: SubscriptionPlan;
      usage: Usage;
      nbAgents: number;
      nbDatastores: number;
    };
    user?: {
      id: string;
      memberships: Membership[];

      // TODO: REMOVE AFTER MIGRATION
      isPremium: boolean;
      customerId: string;
      currentPlan: SubscriptionPlan;
      usage: Usage;
      nbAgents: number;
      nbDatastores: number;
    } & DefaultSession['user'];
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
