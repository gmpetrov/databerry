import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface Props {
  url: string;
  host: string;
}

export const SignIn = ({ url, host }: Props) => {
  const previewText = `Sign in to Chaindesk`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto font-sans bg-white">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`https://www.chaindesk.ai/app-logo-icon.png`}
                width="60"
                height="57"
                alt="Your App Name"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Sign in to <strong>Chaindesk</strong>
            </Heading>
            <Text className="text-black text-[14px] text-center leading-[24px]">
              Click the button below to sign in and continue enjoying our
              services.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                pX={20}
                pY={12}
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
                href={url}
              >
                Sign In
              </Button>
            </Section>
            <Text className="text-[#666666] text-[12px] leading-[24px] mt-4">
              If you have any issues with signing in, feel free to
              <Link href="mailto:support@chaindesk.ai" className="underline">
                {' '}
                contact us
              </Link>
              .
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you were not expecting this sign-in link, you can ignore this
              email. If you are concerned about your account s safety, please
              reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SignIn;
