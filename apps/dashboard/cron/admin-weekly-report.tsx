import React from 'react';

import { AdminStats, render } from '@chaindesk/emails';
import {
  DSRepartitionArgs,
  TopCustomer,
  UserRepartitionArgs,
} from '@chaindesk/emails/src/AdminStats';
import mailer from '@chaindesk/lib/mailer';
import prisma from '@chaindesk/prisma/client';

(async () => {
  console.log(`Admin Stats: Start`);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const endDate = new Date();

  const getData = async (until: Date) => {
    const nbSubscriptions = await prisma.subscription.count({
      where: {
        status: 'active',
        createdAt: {
          lte: until,
        },
      },
    });

    const nbTotalMsgGenerated = await prisma.message.count({
      where: {
        from: 'agent',
        createdAt: {
          lte: until,
        },
      },
    });

    const nbTotalInternalMsg = await prisma.message.count({
      where: {
        from: 'human',
        conversation: {
          user: {
            isNot: null,
          },
        },
        createdAt: {
          lte: until,
        },
      },
    });

    const nbTotalExternalMsg = await prisma.message.count({
      where: {
        from: 'human',
        conversation: {
          user: {
            is: null,
          },
        },
        createdAt: {
          lte: until,
        },
      },
    });

    const userRepartition = await prisma.user.groupBy({
      ...(UserRepartitionArgs as any),
      where: {
        createdAt: {
          lte: until,
        },
      },
    });

    const dsRepartition = await prisma.appDatasource.groupBy({
      ...(DSRepartitionArgs as any),
      where: {
        createdAt: {
          lte: until,
        },
      },
    });

    const top10CustomerByMessages = (await prisma.$queryRaw`
      SELECT COUNT(*), c.organization_id, u.email, s.status FROM messages
      INNER JOIN public.conversations c ON c.id = messages.conversation_id
      INNER JOIN public.organizations o ON o.id = c.organization_id
      INNER JOIN public.memberships m ON o.id = m.organization_id
      INNER JOIN public.users u ON u.id = m."userId"
      INNER JOIN public.subscriptions s ON s.organization_id = o.id
      WHERE m.role='OWNER' AND messages."from" = 'agent'
      GROUP BY c.organization_id, u.email, s.status
      ORDER BY count(*) DESC
      LIMIT 10
    `) as TopCustomer[];

    const top10CustomerByDatasources = (await prisma.$queryRaw`
      SELECT COUNT(*), data_sources.organization_id, u.email, s.status FROM data_sources
      INNER JOIN public.organizations o ON o.id = data_sources.organization_id
      INNER JOIN public.memberships m ON o.id = m.organization_id
      INNER JOIN public.users u ON u.id = m."userId"
      INNER JOIN public.subscriptions s ON s.organization_id = o.id
      WHERE m.role='OWNER'
      GROUP BY data_sources.organization_id, u.email, s.status
      ORDER BY count(*) DESC
      LIMIT 10
    `) as TopCustomer[];

    return {
      nbSubscriptions,
      userRepartition,
      dsRepartition,
      top10CustomerByMessages,
      top10CustomerByDatasources,
      nbTotalMsgGenerated,
      nbTotalInternalMsg,
      nbTotalExternalMsg,
    };
  };

  const prevData = await getData(startDate);
  const latestData = await getData(endDate);

  // console.log(`Admin Stats:`, latestData);

  await mailer.sendMail({
    from: {
      name: 'Chaindesk',
      address: process.env.EMAIL_FROM!,
    },
    to: process.env.ADMIN_EMAIL,
    subject: `📊 Weekly Admin Stats - Chaindesk`,
    html: render(<AdminStats data={latestData as any} prevData={prevData} />),
  });

  console.log(`Admin Stats: End`);
})();
