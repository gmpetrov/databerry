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

export type TopCustomer = {
  count: number;
  email: string;
  organization_id: string;
  status: string;
};

type Props = {
  title: string;
  description: string;
  cta?: {
    label: string;
    href: string;
  };
};

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
                src={`https://www.chaindesk.ai/app-logo-light.png`}
                width="200"
                height="auto"
                alt="Vercel"
                className="mx-auto my-0 "
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

              {props.cta && (
                <>
                  <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                  <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                      pX={20}
                      pY={12}
                      className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
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
