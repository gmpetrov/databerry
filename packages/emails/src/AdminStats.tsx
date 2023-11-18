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

const exampleData = {
  nbSubscriptions: 10,
  nbTotalMsgGenerated: 42,
  nbTotalInternalMsg: 42,
  nbTotalExternalMsg: 42,
  userRepartition: [
    { _count: 9910, viaProduct: 'chaindesk' },
    { _count: 5, viaProduct: 'www.resolveai.io' },
    { _count: 1, viaProduct: 'www.chatbotgpt.ai' },
  ],
  dsRepartition: [
    { _count: 114906, type: 'web_page' },
    { _count: 23568, type: 'google_drive_file' },
    { _count: 17010, type: 'file' },
    { _count: 798, type: 'qa' },
    { _count: 200, type: 'web_site' },
    { _count: 54, type: 'google_drive_folder' },
    { _count: 40, type: 'notion_page' },
    { _count: 13, type: 'text' },
    { _count: 4, type: 'notion' },
  ],
  top10CustomerByMessages: [
    {
      count: 4165,
      organization_id: 'clmrgkt3z09pq0u5dd5fqfap4',
      email: 'github@octolus.net',
      status: 'active',
    },
    {
      count: 4117,
      organization_id: 'clmqs59zx00020un40t9nsnmk',
      email: 'georgesm.petrov@gmail.com',
      status: 'active',
    },
  ],
  top10CustomerByDatasources: [
    {
      count: 40449,
      organization_id: 'clmrgnuw80c630u5d7r6n30ds',
      email: 'chendi@email.jijyun.cn',
      status: 'active',
    },
    {
      count: 17849,
      organization_id: 'clmrgjut708xq0u5dzbwtgcyh',
      email: 'info@degreegrading.com',
      status: 'active',
    },
  ],
} as any;

export const AdminStats = ({
  data = exampleData,
  prevData = exampleData,
}: {
  data: AdminStats;
  prevData: AdminStats;
}) => {
  const previewText = `📊 Weekly Admin Stats`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://www.chaindesk.ai/app-logo-icon.png`}
                width="50"
                height="auto"
                alt="Vercel"
                className="mx-auto my-0 "
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {previewText}
            </Heading>

            <Section className="w-full">
              <Text className="text-black text-[18px] leading-[24px]">
                <strong>Nb Subscriptions</strong>
              </Text>

              <Row>
                <Column colSpan={1} className="text-left">
                  <Text className="m-0">
                    <strong>{data.nbSubscriptions}</strong> active
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>
                      {data.nbSubscriptions - prevData.nbSubscriptions} (
                      {((data.nbSubscriptions - prevData.nbSubscriptions) /
                        prevData.nbSubscriptions) *
                        100}
                      %)
                    </strong>{' '}
                    since last week
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Section className="w-full">
              <Text className="text-black text-[18px] leading-[24px]">
                <strong>Total Messages</strong>
              </Text>

              <Row>
                <Column colSpan={1}>
                  <Text className="m-0">Total Msg Generated</Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>{data.nbTotalMsgGenerated}</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>
                      +{data.nbTotalMsgGenerated - prevData.nbTotalMsgGenerated}
                    </strong>
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column colSpan={1}>
                  <Text className="m-0">Total Internal Msg</Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>{data.nbTotalInternalMsg}</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>
                      +{data.nbTotalInternalMsg - prevData.nbTotalInternalMsg}
                    </strong>
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column colSpan={1}>
                  <Text className="m-0">Total External Msg</Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>{data.nbTotalExternalMsg}</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>
                      +{data.nbTotalExternalMsg - prevData.nbTotalExternalMsg}
                    </strong>
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section className="w-full">
              <Text className="text-black text-[18px] leading-[24px]">
                <strong>Datasources Repartition</strong>
              </Text>

              <Row>
                <Column colSpan={1}>
                  <Text className="m-0">
                    <strong>Type</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>Count</strong>
                  </Text>
                </Column>
              </Row>
              {data.dsRepartition.map((item, id) => (
                <Row key={id} className="py-0 m-0 my-0">
                  <Column colSpan={1}>
                    <Text className="m-0">{item.type}</Text>
                  </Column>
                  <Column colSpan={1} className="text-right">
                    <Text className="m-0">{`${item._count}`}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section className="w-full">
              <Text className="text-black text-[18px] leading-[24px]">
                <strong>Users Repartition</strong>
              </Text>

              <Row>
                <Column colSpan={1}>
                  <Text className="m-0">
                    <strong>Product</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>Count</strong>
                  </Text>
                </Column>
              </Row>
              {data.userRepartition.map((item, id) => (
                <Row key={id} className="py-0 m-0 my-0">
                  <Column colSpan={1}>
                    <Text className="m-0">{item.viaProduct}</Text>
                  </Column>
                  <Column colSpan={1} className="text-right">
                    <Text className="m-0">{`${item._count}`}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section className="w-full">
              <Text className="text-black text-[18px] leading-[24px]">
                <strong>Top 10 Customers by nb msg generated</strong>
              </Text>

              <Row>
                <Column colSpan={1}>
                  <Text className="m-0">
                    <strong>Email</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>Subscription</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>Count</strong>
                  </Text>
                </Column>
              </Row>
              {data.top10CustomerByMessages.map((item, id) => (
                <Row key={id} className="py-0 m-0 my-0">
                  <Column colSpan={1}>
                    <Text className="m-0">{item.email}</Text>
                  </Column>
                  <Column className="text-right">
                    <Text className="m-0">{`${item.status}`}</Text>
                  </Column>
                  <Column className="text-right">
                    <Text className="m-0">{`${item.count}`}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section className="w-full">
              <Text className="text-black text-[18px] leading-[24px]">
                <strong>Top 10 Customers by datasource created</strong>
              </Text>

              <Row>
                <Column colSpan={1}>
                  <Text className="m-0">
                    <strong>Email</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>Subscription</strong>
                  </Text>
                </Column>
                <Column colSpan={1} className="text-right">
                  <Text className="m-0">
                    <strong>Count</strong>
                  </Text>
                </Column>
              </Row>
              {data.top10CustomerByDatasources.map((item, id) => (
                <Row key={id} className="py-0 m-0 my-0">
                  <Column colSpan={1}>
                    <Text className="m-0">{item.email}</Text>
                  </Column>
                  <Column className="text-right">
                    <Text className="m-0">{`${item.status}`}</Text>
                  </Column>
                  <Column className="text-right">
                    <Text className="m-0">{`${item.count}`}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AdminStats;
