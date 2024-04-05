import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useRouter } from 'next/router';
import React from 'react';

import BlablaFormLoader from '@app/components/BlablaFormLoader';
import ColorSchemeToggle from '@app/components/Layout/ColorSchemeToggle';
import SEO from '@app/components/SEO';

import { Agent } from '@chaindesk/prisma';
import PoweredBy from '@chaindesk/ui/PoweredBy';

export default function FormPage(props: { agent: Agent }) {
  const router = useRouter();
  const formId = router.query.formId as string;

  const conversationId = router.query.conversationId as string | undefined;
  const messageId = router.query.messageId as string | undefined;
  return (
    <>
      <SEO
        title={`AI powered conversational forms | Chaindesk.ai`}
        description={`Build ChatGPT-powered conversational forms with Chaindesk.ai`}
        url={`https://app.chaindesk.ai/forms/${formId}`}
      />
      {/*

      
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>

*/}
      <Stack component="main" sx={{ width: '100dvw', height: '100dvh' }}>
        <Stack sx={{ position: 'fixed', top: 20, right: 20 }}>
          <ColorSchemeToggle />
        </Stack>

        <BlablaFormLoader
          formId={formId}
          conversationId={conversationId}
          messageId={messageId}
        />
      </Stack>
    </>
  );
}
