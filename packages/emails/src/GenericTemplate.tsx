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

export type TopCustomer = {
  count: number;
  email: string;
  organization_id: string;
  status: string;
};

type Props = {
  title: string;
  description?: string;
  messages?: {
    id: string;
    text: string;
    from: 'agent' | 'human';
    fromName?: string;
    fromPicture?: string;
  }[];
  cta?: {
    label: string;
    href: string;
  };
};

// {
//   cta = {
//     label: 'View Conversation',
//     href: '#',
//   },
//   title = '💬 New Message',
//   description = "You've received a new message",
//   messages = [
//     {
//       id: '1',
//       text: 'Hello World',
//       from: 'human',
//     },
//     {
//       id: '2',
//       text: 'How can I help you?',
//       from: 'human',
//       fromName: 'Georges',
//       fromPicture:
//         'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
//     },
//   ],
// }

export const GenericTemplate = (props: Props) => {
  return (
    <Html>
      <Head />
      <Preview>{props.title}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://www.chaindesk.ai/logo.png`}
                width="200"
                height="auto"
                alt="Vercel"
                className="mx-auto my-0 w-10"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              {props.title}
            </Heading>

            <Section className="w-full">
              {props.description && (
                <Text className="text-black text-[16px] leading-[24px] text-center">
                  {props.description}
                </Text>
              )}

              {props.messages?.length && (
                <Container>
                  {(props.messages || []).map((message) => (
                    <Section
                      key={message.id}
                      className={clsx(
                        'px-4 py-2 mb-2 border border-solid border-[#eaeaea] rounded-lg',
                        {
                          'bg-[#eaeaea50]': message.from === 'agent',
                        }
                      )}
                    >
                      <Row>
                        {message?.fromPicture && (
                          <Column className="w-12">
                            <Img
                              src={`${message?.fromPicture}`}
                              width="30"
                              height="30"
                              alt="Vercel"
                              className="rounded-full"
                            />
                          </Column>
                        )}

                        {message?.fromName && (
                          <Column>
                            <Text className="text-black text-[14px] font-bold  ">
                              {message.fromName}
                            </Text>
                          </Column>
                        )}
                      </Row>
                      <Text>{message.text}</Text>
                    </Section>
                  ))}
                </Container>
              )}

              {props.cta && (
                <>
                  <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                  <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                      className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-4 py-3"
                      href={props.cta.href}
                    >
                      {props.cta.label}
                    </Button>
                  </Section>
                </>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GenericTemplate;
