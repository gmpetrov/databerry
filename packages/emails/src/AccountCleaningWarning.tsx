import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import React from 'react';

import { Prisma } from '@chaindesk/prisma';

export type TopCustomer = {
  count: number;
  email: string;
  organization_id: string;
  status: string;
};

export const DSRepartitionArgs: Prisma.AppDatasourceGroupByArgs = {
  by: 'type',
  _count: true,
  orderBy: {
    _count: {
      type: 'desc',
    },
  },
};

export const UserRepartitionArgs: Prisma.UserGroupByArgs = {
  by: 'viaProduct',
  _count: true,
  orderBy: {
    _count: {
      viaProduct: 'desc',
    },
  },
};

export type DSRepartition = Awaited<
  Prisma.GetAppDatasourceGroupByPayload<typeof DSRepartitionArgs>
>;

export type UserRepartition = Awaited<
  Prisma.GetUserGroupByPayload<typeof UserRepartitionArgs>
>;

export type AdminStats = {
  nbSubscriptions: number;
  nbTotalMsgGenerated: number;
  nbTotalInternalMsg: number;
  nbTotalExternalMsg: number;
  userRepartition: UserRepartition;
  dsRepartition: DSRepartition;
  top10CustomerByMessages: TopCustomer[];
  top10CustomerByDatasources: TopCustomer[];
};

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const AccountCleaningWarning = ({ ctaLink }: { ctaLink?: string }) => {
  const previewText = `🚨 Data Deletion Warning`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://www.chaindesk.ai/app-logo-light.png`}
                width="200"
                height="auto"
                alt="Vercel"
                className="mx-auto my-0 "
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {previewText}
            </Heading>

            <Section className="w-full">
              <Text className="text-black text-[16px] leading-[24px]">
                As your premium subscription has ended, your account will revert
                to our standard service, which includes limited usage of the
                platform.
              </Text>

              <Text className="text-black text-[16px] leading-[24px]">
                The following ressources will be{' '}
                <span className="font-bold text-red-500">
                  deleted/disabled in 24 hours:
                </span>
              </Text>

              <ul>
                <li>
                  <strong>Datastores</strong>
                </li>
                <li>
                  <strong>Conversations History</strong>
                </li>
                <li>
                  <strong>Inbox Messages</strong>
                </li>
                <li>
                  <strong>API Disabled</strong>
                </li>
                <li>
                  <strong>All Plugins disabled</strong>
                </li>
              </ul>

              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  pX={20}
                  pY={12}
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
                  href={ctaLink}
                >
                  Renew Subscription
                </Button>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AccountCleaningWarning;
