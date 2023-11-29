import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Input } from '@mui/joy';
import { LLMTaskOutputType } from '@prisma/client';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import SEO from '@app/components/SEO';
import TopBar from '@app/components/TopBar';

import { generateActionFetcher, HTTP_METHOD } from '@chaindesk/lib/swr-fetcher';
import YoutubeApi from '@chaindesk/lib/youtube-api';

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
  const { register, handleSubmit, formState } = useForm<FormType>({
    mode: 'onChange',
    resolver: zodResolver(schema),
  });

  const summaryMutation = useSWRMutation(
    '/api/chains/query',
    generateActionFetcher(HTTP_METHOD.POST)
  );

  const onSubmit = async (payload: FormType) => {
    try {
      await toast.promise(
        summaryMutation.trigger({
          ...payload,
          type: LLMTaskOutputType.youtube_summary,
        }),
        {
          loading: 'Searching...',
          success: 'Done!',
          error: 'Something went wrong',
        }
      );
      const regex = /(?:\?v=|&v=|youtu\.be\/)([^&#]+)/;
      const match = payload.url.match(regex);

      router.replace(`youtube/${match![1]}`);
    } catch (e) {}
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

      <Box className="container p-4 mx-auto max-w-7xl flex justify-center   min-h-[80vh]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-wrap items-center space-y-2 md:flex md:space-y-0 md:space-x-2  min-w-full"
        >
          <Input
            className="flex-1 w-full"
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
      </Box>
    </>
  );
}
