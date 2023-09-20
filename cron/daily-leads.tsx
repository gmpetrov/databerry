import { Lead, Organization, Prisma } from '@prisma/client';
import { render } from '@react-email/components';
import pMap from 'p-map';
import React from 'react';

import DailyLeads from '@app/components/emails/DailyLeads';
import { generateExcelBuffer } from '@app/utils/export/excel-export';
import logger from '@app/utils/logger';
import mailer from '@app/utils/mailer';
import prisma from '@app/utils/prisma-client';

const createReport = async (org: Organization) => {
  const now = new Date();
  const ystd = new Date();
  ystd.setDate(now.getDate() - 1);

  const leads = await prisma.lead.findMany({
    where: {
      organizationId: org.id,
      createdAt: {
        gte: ystd,
        lte: now,
      },
    },
    include: {
      agent: {
        select: {
          name: true,
        },
      },
    },
  });

  const ownerEmail = (org as any).memberships[0].user.email as string;
  if (leads?.length <= 0 && ownerEmail) {
    return;
  }

  const header = ['id', 'agent', 'email', 'created_at'];

  const rows = leads.map((each) => [
    each.id,
    each?.agent?.name || '',
    each.email,
    // each.name,
    // each.phone,
    each.createdAt,
  ]);

  const buffer = await generateExcelBuffer<Lead>({ header, rows });

  await mailer.sendMail({
    from: {
      name: 'Chaindesk',
      address: process.env.EMAIL_FROM!,
    },
    to: ownerEmail,
    subject: `🎯 Your Daily Leads`,
    attachments: [
      {
        filename: 'leads.csv',
        content: buffer as Buffer,
      },
    ],
    html: render(
      <DailyLeads
        nbLeads={rows?.length}
        ctaLink={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/logs`}
      />
    ),
  });
};

(async () => {
  logger.info('Starting cron job: daily-leads');
  const orgs = await prisma.organization.findMany({
    where: {
      subscriptions: {
        some: {
          status: 'active',
        },
      },
    },
    include: {
      memberships: {
        where: {
          role: 'OWNER',
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  logger.info(`Found ${orgs.length} organizations`);

  await pMap(orgs, createReport, {
    concurrency: 1,
  });

  logger.info(`Finished cron job: daily-leads`);
})();
