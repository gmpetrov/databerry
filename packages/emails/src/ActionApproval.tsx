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

import { Message } from '@chaindesk/prisma';

interface ActionApprovalProps {
  history: Partial<Message>[];
  ctaLink: string;
  agentName: string;
  approvals: { name: string; payload: any }[];
}

export const ActionApprovalTemplate = ({
  agentName = 'Adam',
  approvals = [
    {
      name: 'cat picture generator',
      payload: {
        catType: 'cute',
      },
    },
    { name: 'http tool request', payload: {} },
  ],
  ctaLink = '/emails',
  history = [
    {
      id: '1',
      text: 'Hello World',
      from: 'human',
    },
    {
      id: '2',
      text: 'How can I help you?',
      from: 'agent',
    },
  ],
}: ActionApprovalProps) => {
  const previewText = `🔐  Approval  Requested`;

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
                width="200"
                height="auto"
                alt="Vercel"
                className="mx-auto my-0 w-10"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {previewText}
              {' from agent '}
              <br />
              <strong>{agentName}</strong>
            </Heading>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Row>
              <Container>
                <Text className="font-bold text-black text-md">
                  The following action(s) require your approval:
                </Text>
                <Section
                  className={clsx(
                    'px-4  border mb-1 border-solid border-[#eaeaea] rounded-lg'
                  )}
                >
                  {(approvals || []).map(({ name, payload }, i) => (
                    <li className="my-5 text-sm capitalize">
                      {name}{' '}
                      {!!payload && Object.keys(payload).length > 0
                        ? JSON.stringify(payload, null, 2)
                        : ''}
                    </li>
                  ))}
                </Section>

                <Text className="font-bold text-black text-md">
                  Conversation history:
                </Text>

                {(history || [])
                  .filter((each) => each.text?.trim() !== '')
                  .map((message) => (
                    <Section
                      key={message.id}
                      className={clsx(
                        'px-4  border my-2 border-solid border-[#eaeaea] rounded-lg',
                        {
                          'bg-[#eaeaea50]': message.from === 'agent',
                        }
                      )}
                    >
                      <Text>{message.text}</Text>
                    </Section>
                  ))}
                {ctaLink && (
                  <>
                    <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                    <Section className="text-center mt-[32px] mb-[32px]">
                      <Button
                        className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
                        href={ctaLink}
                      >
                        Take Action
                      </Button>
                    </Section>
                    <Text className="text-black text-[14px] leading-[24px]">
                      or copy and paste this URL into your browser:
                      <Link
                        href={ctaLink}
                        className="text-blue-600 no-underline"
                      >
                        {ctaLink}
                      </Link>
                    </Text>
                  </>
                )}
              </Container>
            </Row>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ActionApprovalTemplate;
