import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Input, Typography } from '@mui/joy';
import { LLMTaskOutputType } from '@prisma/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import CopyButton from '@app/components/CopyButton';
import ColorSchemeToggle from '@app/components/Layout/ColorSchemeToggle';
import Header from '@app/components/Layout/Header';
import Logo from '@app/components/Logo';
import SEO from '@app/components/SEO';
import TopBar from '@app/components/TopBar';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';

const schema = z.object({
  url: z.string().refine(
    (url) => {
      const regex =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9\-_]{11}$/;
      return regex.test(url);
    },
    {
      message: 'Invalid YouTube video URL',
    }
  ),
});

type FormType = z.infer<typeof schema>;

export default function Youtube() {
  const router = useRouter();
  const { register, handleSubmit, formState, trigger } = useForm<FormType>({
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const [summary, setSummary] = useState('');

  const summaryMutation = useSWRMutation(
    '/api/chains/query',
    generateActionFetcher(HTTP_METHOD.POST)
  );

  const onSubmit = async (payload: FormType) => {
    const response = await summaryMutation.trigger({
      ...payload,
      type: LLMTaskOutputType.youtube_summary,
    });

    setSummary(response.summary);
  };
  return (
    <>
      <SEO
        title="Youtube Tool By Chaindesk."
        description="Generate youtube video summary instantly for free."
        uri={router.pathname}
        image={'og-image'}
      />
      <TopBar />

      <Box className="container p-4 mx-auto max-w-7xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-wrap items-center space-y-2 md:flex md:space-y-0 md:space-x-2"
        >
          <Input
            className="flex-1"
            {...register('url')}
            placeholder="Paste your youtube video link here"
            disabled={summaryMutation.isMutating}
          />
          <Button
            type="submit"
            variant="solid"
            color="primary"
            disabled={!formState.isValid}
            loading={summaryMutation.isMutating}
          >
            Summarize
          </Button>
        </form>
        <Box className="w-full pt-4 ">
          {!formState.isValid && (
            <Typography className="text-sm text-red-800">
              {(formState.errors as any)?.youtube_url?.message}
            </Typography>
          )}
          <ReactMarkdown
            className="min-w-full prose dark:text-white"
            remarkPlugins={[remarkGfm]}
          >
            {summary}
          </ReactMarkdown>
          <CopyButton text={summary} />
        </Box>
      </Box>
    </>
  );
}
