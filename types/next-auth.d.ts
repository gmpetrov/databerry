import type { SubscriptionPlan, Usage } from '@prisma/client';
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
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
