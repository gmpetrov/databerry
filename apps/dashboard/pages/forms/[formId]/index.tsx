import Stack from '@mui/joy/Stack';
import { useRouter } from 'next/router';
import React from 'react';

import BlablaFormLoader from '@app/components/BlablaFormLoader';
import SEO from '@app/components/SEO';

import { Agent } from '@chaindesk/prisma';

export default function FormPage(props: { agent: Agent }) {
  const router = useRouter();
  const formId = router.query.formId as string;

  return (
    <>
      <SEO
        title={`Blablaform - AI powered conversational forms`}
        description={`Blablaform - AI powered conversational forms`}
        url={`https://chaindesk.ai/forms/${formId}`}
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
        <BlablaFormLoader formId={formId} />
      </Stack>
    </>
  );
}
