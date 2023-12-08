import pMap from 'p-map';
import React from 'react';

import { AccountCleaningWarning, render } from '@chaindesk/emails';
import mailer from '@chaindesk/lib/mailer';
import prisma from '@chaindesk/prisma/client';

(async () => {
  console.log(`Account Cleaning Warning: Start`);
  let yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'canceled',
      ended_at: {
        gte: yesterday,
        lt: new Date().toISOString(),
      },
    },
    include: {
      organization: {
        include: {
          memberships: {
            where: {
              role: 'OWNER',
            },
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  console.log('subscriptions', JSON.stringify(subscriptions, null, 2));

  let counter = 0;
  await pMap(
    subscriptions,
    async (s) => {
      const email = s?.organization?.memberships?.[0].user?.email;

      if (!email) {
        console.log(
          `Account Cleaning Warning: No email found for subscription ${s.id}`
        );
        return;
      }

      await mailer.sendMail({
        from: {
          name: 'Chaindesk',
          address: process.env.EMAIL_FROM!,
        },
        to: email,
        subject: `🚨 Data Deletion Warning`,
        html: render(
          <AccountCleaningWarning
            ctaLink={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/settings/billing`}
          />
        ),
      });
      counter++;
    },
    {
      concurrency: 4,
    }
  );

  console.log(`Account Cleaning Warning: ${counter} emails sent`);

  console.log(`Account Cleaning Warning: End`);
})();
