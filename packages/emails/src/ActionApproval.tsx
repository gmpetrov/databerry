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
  toolNames: string[];
}

export const ActionApprovalTemplate = ({
  toolNames = ['cat picture generator', 'api solver request'],
  ctaLink = '/emails',
  history = [
    {
      id: '1',
      text: 'Hello World',
      from: 'human',
    },
    {
      id: '2',
      text: 'How can I help you? flkdsj skldjf lksdfj lksdjf lskdfjsdlfk jdlksdj lfdskjf ',
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
                src={`https://www.chaindesk.ai/app-logo-icon.png`}
                width="50"
                height="auto"
                alt="Vercel"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {previewText}
            </Heading>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Row>
              <Container>
                <Text className="text-black text-lg ">
                  Approval Requested For The Following Tools:
                </Text>
                <Section
                  className={clsx(
                    'px-4  border mb-1 border-solid border-[#eaeaea] rounded-lg'
                  )}
                >
                  {(toolNames || []).map((name, i) => (
                    <li className="my-5 capitalize text-sm">{name}</li>
                  ))}
                </Section>

                <Text className="text-black text-lg">
                  Conversation History:
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
                        pX={20}
                        pY={12}
                        className="bg-[#fff] rounded text-black text-[12px] font-semibold no-underline text-center border border-solid border-[#eaeaea]"
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
