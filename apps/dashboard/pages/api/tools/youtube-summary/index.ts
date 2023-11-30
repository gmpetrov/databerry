import { ConstructionOutlined } from '@mui/icons-material';
import Cors from 'cors';
import { NextApiResponse } from 'next';
import { z, ZodSchema } from 'zod';

import ChatModel from '@chaindesk/lib/chat-model';
import { ModelConfig } from '@chaindesk/lib/config';
import countTokens from '@chaindesk/lib/count-tokens';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import ytTool, { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import runMiddleware from '@chaindesk/lib/run-middleware';
import splitTextByToken from '@chaindesk/lib/split-text-by-token';
import generateSummary from '@chaindesk/lib/summarize';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { YoutubeSummarySchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import YoutubeApi from '@chaindesk/lib/youtube-api';
import zodParseJSON from '@chaindesk/lib/zod-parse-json';
import { AgentModelName, LLMTaskOutputType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
const handler = createLazyAuthHandler();

export const getLatestVideos = async () => {
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

export const queryFreeTools = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const { url } = YoutubeSummarySchema.parse(req.body);

  const Youtube = new YoutubeApi();
  const videoId = YoutubeApi.extractVideoId(url);
  //TODO: get video name,  description date published
  const videoSnippet = await Youtube.getVideoSnippetById(videoId!);

  if (!videoId) {
    throw new Error('The url is not a valid youtube video.');
  }

  const found = await prisma.lLMTaskOutput.findUnique({
    where: {
      unique_external_id: {
        type: LLMTaskOutputType.youtube_summary,
        externalId: videoId,
      },
    },
  });

  if (found) {
    return {
      ...(found.output as any)?.['en'],
    };
  } else {
    const transcripts = await YoutubeApi.transcribeVideo(url);

    const text = transcripts.reduce(
      (acc, { text, offset }) =>
        acc + `""" ${Math.ceil(offset / 1000)}s """ ${text} `,
      ''
    );

    const [chunkedText] = await splitTextByToken({
      text,
      chunkSize: ModelConfig[AgentModelName.gpt_4_turbo].maxTokens * 0.7,
    });

    const model = new ChatModel();

    const result = await model.call({
      model: ModelConfig[AgentModelName.gpt_4_turbo].name,
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
          content:
            'You are a helpful assistant. Your task is generate a very detailed summary of a given text in a comprehensive, educational way. Answer in english.',
        },
        {
          role: 'user',
          content: `Youtube video transcript with timecodes surrounded by triple quotes: ${chunkedText}`,
        },
      ],
    });

    const data = zodParseJSON(Schema)(
      result?.completion?.choices?.[0]?.message?.tool_calls?.[0]?.function
        ?.arguments as string
    );

    const output = await prisma.lLMTaskOutput.create({
      data: {
        externalId: videoId,
        type: 'youtube_summary',
        output: {
          metadata: {
            ...videoSnippet,
          },
          en: {
            ...data,
          },
        },
        usage: result?.usage as any,
      },
    });

    return output;
  }
};

handler.post(
  validate({
    handler: respond(queryFreeTools),
    body: YoutubeSummarySchema,
  })
);

export default handler;
