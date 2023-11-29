import Head from 'next/head';
import { useSession } from 'next-auth/react';
import React from 'react';

type Props = {};

function StripePricingTable({}: Props) {
  const { data: session, status } = useSession();

  return (
    <>
      <Head>
        <script
          id="stripe-pricing-table"
          async
          src="https://js.stripe.com/v3/pricing-table.js"
        ></script>
      </Head>
      <stripe-pricing-table
        pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        client-reference-id={session?.organization?.id}
        customer-email={session?.user?.email}
      ></stripe-pricing-table>
    </>
  );
}

export default StripePricingTable;
