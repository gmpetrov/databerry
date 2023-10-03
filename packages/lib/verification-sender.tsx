import { Theme } from 'next-auth';
import { SendVerificationRequestParams } from 'next-auth/providers';
import { createTransport, SentMessageInfo, TransportOptions } from 'nodemailer';

import { render, SignIn } from '@chaindesk/emails';

async function sendVerificationRequest(params: SendVerificationRequestParams) {
  const { identifier, url, provider, theme } = params;
  const { host } = new URL(url);
  const transport = createTransport(provider.server);
  const result: SentMessageInfo = await transport.sendMail({
    to: identifier,
    from: provider.from,
    subject: `Sign in to ${host}`,
    html: render(<SignIn host={host} url={url} />),
    text: render(<SignIn host={host} url={url} />, {
      plainText: true,
    }),
  });
  const failed = result?.rejected?.concat(result?.pending)?.filter(Boolean);
  if (failed?.length) {
    throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
  }
}

export default sendVerificationRequest;
