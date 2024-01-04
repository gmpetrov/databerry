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
        <Stack sx={{ position: 'fixed', top: 20, right: 20 }}>
          <ColorSchemeToggle />
        </Stack>

        <BlablaFormLoader formId={formId} />

        <Stack
          sx={{
            position: 'fixed',

            // bottom: 20, left: 20
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <a
            href="https://chaindesk.ai"
            target="_blank"
            style={{
              textDecoration: 'none',
              marginLeft: 'auto',
              marginRight: 'auto',
              // marginBottom: '2px',
            }}
          >
            <Chip variant="outlined" size="sm" color="neutral">
              <Box className="truncate" sx={{ whiteSpace: 'nowrap' }}>
                <Typography level="body-xs" fontSize={'10px'}>
                  Powered by{' '}
                  <Typography color="primary" fontWeight={'bold'}>
                    ⚡️ Blablaform
                  </Typography>
                </Typography>
              </Box>
            </Chip>
          </a>
        </Stack>
      </Stack>
    </>
  );
}
