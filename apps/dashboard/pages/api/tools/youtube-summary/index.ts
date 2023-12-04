import { ConstructionOutlined } from '@mui/icons-material';
import axios from 'axios';
import cuid from 'cuid';
import { NextApiResponse } from 'next';
import pMap from 'p-map';
import { z, ZodSchema } from 'zod';

import ChatModel from '@chaindesk/lib/chat-model';
import { ModelConfig } from '@chaindesk/lib/config';
import countTokens from '@chaindesk/lib/count-tokens';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import rateLimit from '@chaindesk/lib/middlewares/rate-limit';
import ytTool, { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import splitTextByToken from '@chaindesk/lib/split-text-by-token';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { YoutubeSummarySchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import YoutubeApi from '@chaindesk/lib/youtube-api';
import zodParseJSON from '@chaindesk/lib/zod-parse-json';
import { AgentModelName, LLMTaskOutputType, Prisma } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const getLatestVideos = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const outputs = await prisma.lLMTaskOutput.findMany({
    where: {
      type: LLMTaskOutputType.youtube_summary,
    },
    take: 3,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return outputs;
};

handler.get(respond(getLatestVideos));

export const createYoutubeSummary = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const { url } = YoutubeSummarySchema.parse(req.body);

  const Youtube = new YoutubeApi();
  const videoId = YoutubeApi.extractVideoId(url);
  //TODO: get video name,  description date published

  if (!videoId) {
    throw new Error('The url is not a valid youtube video.');
  }

  const refresh =
    req.query.refresh === 'true' &&
    req?.session?.roles?.includes?.('SUPERADMIN');

  // const videoSnippet = await Youtube.getVideoSnippetById(videoId!);
  const metadata = await YoutubeApi.getVideoMetadataWithoutApiKeys(videoId);

  if (!metadata?.title) {
    throw new Error('Failed to fetch metadata for the video.');
  }

  const found = await prisma.lLMTaskOutput.findUnique({
    where: {
      unique_external_id: {
        type: LLMTaskOutputType.youtube_summary,
        externalId: videoId,
      },
    },
  });

  if (found && !refresh) {
    return found;
  } else {
    const transcripts = await YoutubeApi.transcribeVideo(url);

    const text = YoutubeApi.groupTranscriptsBySeconds({
      nbSeconds: 60,
      transcripts,
    }).reduce(
      (acc, { text, offset }) =>
        acc + `(offset: ${Math.ceil(offset / 1000)}s) ${text}\n`,
      ''
    );

    // const text = groupBySentences(transcripts)
    //   .map((each) => ({
    //     text: each.text?.replace(/^- /, ''),
    //     offset: `${Math.ceil(each.offset / 1000)}s`,
    //   }))
    //   .map((each) => `[starts at ${each.offset}] ${each.text}`)
    //   .join('\n');

    const modelName = AgentModelName.gpt_3_5_turbo;
    const chunks = await splitTextByToken({
      text,
      chunkSize: ModelConfig[modelName].maxTokens * 0.5,
    });

    await rateLimit({
      duration: 60,
      limit: 2,
    })(req, res);

    if (!refresh) {
      // Trick to bypass cloudflare 100s timeout limit
      res.json({ processing: true });
    }

    const model = new ChatModel();

    const results = Array(chunks.length) as Schema[];

    const run = async (chunkedText: string, index: number) => {
      const result = await model.call({
        model: ModelConfig[modelName].name,
        tools: [ytTool],
        tool_choice: {
          type: 'function',
          function: {
            name: 'youtube_summary',
          },
        },
        messages: [
          {
            role: 'system',
            content: `Extract thoroughly all chapters from a given youtube video chunked transcript. Make sure you include time offsets. Use English language only.`,
          },
          {
            role: 'user',
            content: `Video transcript chunk number ${index} : ${chunkedText}`,
          },
        ],
      });

      results[index] = zodParseJSON(Schema)(
        result?.completion?.choices?.[0]?.message?.tool_calls?.[0]?.function
          ?.arguments as string
      );
    };

    await pMap(chunks, run, { concurrency: chunks.length });

    const data = results.reduce(
      (acc, each) => {
        acc.chapters.push(...each.chapters);
        return acc;
      },
      { chapters: [] as Schema['chapters'] }
    );

    const chaptersText = data.chapters.map((each) => each.summary).join(' ');

    const summaryCall = await model.call({
      model: ModelConfig[modelName].name,
      messages: [
        {
          role: 'system',
          content: `Generate a short summary of a given youtube video transcript. Provide your response in raw markdown format`,
        },
        {
          role: 'user',
          content: `Video: ### ${chaptersText} ### Short summary that highlights most important informations for a TLDR section. Use bullet points: `,
        },
      ],
    });

    const videoSummary =
      summaryCall?.completion?.choices?.[0]?.message?.content;

    const id = found?.id || cuid();

    const payload = {
      id,
      externalId: videoId,
      type: 'youtube_summary',
      output: {
        metadata: {
          title: metadata.title,
          thumbnails: {
            high: {
              url: metadata.thumbnail_url,
              width: metadata.thumbnail_width,
              height: metadata.thumbnail_height,
            },
          },
        },
        en: {
          ...data,
          videoSummary,
        },
      },
      // usage: result?.usage as any,
    } as Prisma.LLMTaskOutputCreateArgs['data'];

    const output = await prisma.lLMTaskOutput.upsert({
      where: {
        id,
      },
      create: payload,
      update: payload,
    });

    req.logger.info(`Finished processing youtube video ${videoId}`);

    return output;
  }
};

handler.post(
  pipe(
    validate({
      handler: respond(createYoutubeSummary),
      body: YoutubeSummarySchema,
    })
  )
);

export default pipe(cors({ methods: ['GET', 'POST', 'HEAD'] }), handler);
