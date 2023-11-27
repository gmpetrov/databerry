import { Box } from '@mui/joy';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import CopyButton from '@app/components/CopyButton';
import SEO from '@app/components/SEO';
import TopBar from '@app/components/TopBar';

import prisma from '@chaindesk/prisma/client';

interface SummaryPageProps {
  summary?: string;
  notFound?: string;
}

export default function SummaryPage({ summary, notFound }: SummaryPageProps) {
  const router = useRouter();
  if (notFound) {
    return null;
  }

  return (
    <>
      <TopBar />
      <SEO
        title="Youtube Tool By Chaindesk."
        description="Generate youtube video summary instantly for free."
        uri={router.pathname}
        image={'og-image'}
      />
      <Box className="container p-4 mx-auto max-w-7xl">
        <Box className="w-full pt-4 ">
          <ReactMarkdown
            className="min-w-full prose dark:text-white"
            remarkPlugins={[remarkGfm]}
          >
            {summary!}
          </ReactMarkdown>
          <CopyButton text={summary!} />
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const externalId = context.params?.id as string;
    const llmTaskOutput = await prisma.lLMTaskOutput.findUnique({
      where: {
        unique_external_id: {
          externalId: externalId,
          type: 'youtube_summary',
        },
      },
    });

    if (!llmTaskOutput) {
      return { props: { notFound: true } };
    }

    return {
      props: {
        summary: (llmTaskOutput.output as any)?.['en']?.summary,
        notFound: false,
      },
    };
  } catch (err) {
    console.error('Error fetching data:', err);
    return { props: { notFound: true } };
  }
};
