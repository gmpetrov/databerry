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
import clsx from 'clsx';
import * as React from 'react';

import { Message } from '@chaindesk/prisma';

interface VercelInviteUserEmailProps {
  agentName?: string;
  messages?: Partial<Message>[];
  ctaLink?: string;
  visitorEmail?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const HelpRequest = ({
  messages = [
    {
      id: '1',
      text: 'Hello World',
      from: 'human',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: '42',
      sources: [],
      usage: {},
      eval: 'good',
      read: false,
      inputId: null,
      metadata: {},
    },
    {
      id: '2',
      text: 'How can I help you?',
      from: 'agent',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId: '42',
      sources: [],
      usage: {},
      eval: 'good',
      read: false,
      inputId: null,
      metadata: {},
    },
  ],
  visitorEmail = 'hello@world.com',
  agentName = 'John Doe',
  ctaLink = 'https://www.chaindesk.ai/',
}: VercelInviteUserEmailProps) => {
  const previewText = `New conversation started with Agent ${agentName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[22px]">
              <Img
                src={`https://www.chaindesk.ai/logo.png`}
                width="50"
                height="auto"
                alt="Vercel"
                className="mx-auto my-0 w-10"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              ❓ Visitor requested human assistance from Agent{' '}
              <strong>{agentName}</strong>
            </Heading>
            {/* <Row>
              <Text className="text-black text-[14px]">
                Visitor Email: <strong>{visitorEmail}</strong>
              </Text>
            </Row> */}
            <Row>
              <Text className="text-black text-[14px]">
                Agent Name: <strong>{agentName}</strong>
              </Text>
            </Row>

            <Row>
              <Text className="text-black text-[14px]">
                Conversation History:
              </Text>
            </Row>

            <Container>
              {(messages || []).map((message, index) => (
                <Section
                  key={message.id || index}
                  className={clsx(
                    'px-4 py-2 mb-2 border border-solid border-[#eaeaea] rounded-lg',
                    {
                      'bg-[#eaeaea50]': message.from === 'agent',
                    }
                  )}
                >
                  <Text>{message.text}</Text>
                </Section>
              ))}
            </Container>
            {/* <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                pX={20}
                pY={12}
                className="bg-[#000] rounded text-white text-[12px] font-semibold no-underline text-center"
                href={`mailto:${visitorEmail}`}
              >
                Reply
              </Button>
            </Section> */}

            {/* <Section>
              <Row>
                <Column align="right">
                  <Img
                    className="rounded-full"
                    src={userImage}
                    width="64"
                    height="64"
                  />
                </Column>
                <Column align="center">
                  <Img
                    src={`${baseUrl}/static/vercel-arrow.png`}
                    width="12"
                    height="9"
                    alt="invited you to"
                  />
                </Column>
                <Column align="left">
                  <Img
                    className="rounded-full"
                    src={teamImage}
                    width="64"
                    height="64"
                  />
                </Column>
              </Row>
            </Section> */}
            {ctaLink && (
              <>
                <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                <Section className="text-center mt-[32px] mb-[32px]">
                  <Button
                    className="bg-[#000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
                    href={ctaLink}
                  >
                    Intervene
                  </Button>
                </Section>
                <Text className="text-black text-[14px] leading-[24px]">
                  or copy and paste this URL into your browser:{' '}
                  <Link href={ctaLink} className="text-blue-600 no-underline">
                    {ctaLink}
                  </Link>
                </Text>
              </>
            )}
            {/* <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" /> */}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default HelpRequest;
