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

interface FormSubmissionProps {
  formName: string;
  ctaLink: string;
  values: Record<string, any>;
}

export const FormSubmission = ({
  formName = 'Satisfaction Survey',
  ctaLink = '/',
  values = {
    'size-fitting': '10',
    'model-purchased': 'Model X',
    'price-value-assessment': 'good',
    'overall-satisfaction-1-5': '4',
  },
}: FormSubmissionProps) => {
  const previewText = `📬 New ${formName} Submission`;

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

            <Row>
              <Container>
                <Text className="text-lg">Informations Collected</Text>
                <Hr />
                {Object.keys(values).map((key, i) => (
                  <Row className="my-2">
                    <Column colSpan={1}>
                      <Text className="m-0 text-md font-semibold">{key}</Text>
                    </Column>
                    <Column colSpan={1} className="text-right">
                      <Text className="m-0">
                        <strong> {values[key]}</strong>
                      </Text>
                    </Column>
                  </Row>
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
                        View Form Submissions
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

export default FormSubmission;
