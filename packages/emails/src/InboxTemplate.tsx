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

type Props = {
  title: string;
  description?: string;
  message: string;
  signature?: string;
  showBranding?: boolean;
};

export const GenericTemplate = ({
  title = 'Chaindesk',
  message = `Hi user,

Thank you for contacting us regarding your subscription concerns. We're here to help! To address the issue, please ensure your payment method is up-to-date and that there are no service outages affecting your account. You can check and update these details in the 'Account Settings' section of our website.
    
If the problem persists, please reply to this email with a description of the issue and any error messages you've received. We're committed to resolving this for you promptly.
    
Best regards,`,
  signature,
  showBranding = true,
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="font-sans bg-white">
          {/* <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]"> */}
          {/* <Section className="p-2 w-full"> */}
          <Text className="text-black whitespace-pre-line">{message}</Text>
          {signature && (
            <>
              <Text
                className="text-black whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: signature,
                }}
              />
            </>
          )}
          {showBranding && (
            <>
              <Text className="text-gray-500">
                Sent from{' '}
                <Link
                  className="text-black underline"
                  href="https://www.chaindesk.ai"
                  target="_blank"
                >
                  Chaindesk
                </Link>
              </Text>
            </>
          )}
          {/* </Section> */}
          {/* </Container> */}
        </Body>
      </Tailwind>
    </Html>
  );
};

export default GenericTemplate;
