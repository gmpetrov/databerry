import { ConstructionOutlined } from '@mui/icons-material';
import Cors from 'cors';
import { NextApiResponse } from 'next';
import { z, ZodSchema } from 'zod';

import ChatModel from '@chaindesk/lib/chat-model';
import { ModelConfig } from '@chaindesk/lib/config';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import ytTool, { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import runMiddleware from '@chaindesk/lib/run-middleware';
import generateSummary from '@chaindesk/lib/summarize';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import YoutubeApi from '@chaindesk/lib/youtube-api';
import zodParseJSON from '@chaindesk/lib/zod-parse-json';
import { LLMTaskOutputType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
const handler = createLazyAuthHandler();

const cors = Cors({
  methods: ['POST', 'HEAD'],
});

const schema = z.object({
  url: z.string(),
  type: z.enum(['youtube_summary']),
});

export const queryFreeTools = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const { url, type } = schema.parse(req.body);

  switch (type) {
    case LLMTaskOutputType.youtube_summary:
      const videoId = YoutubeApi.extractVideoId(url);
      //TODO: get video name,  description date published

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

        const text = transcripts.reduce((acc, { text }) => acc + text, '');

        const model = new ChatModel();

        const result = await model.call({
          model: ModelConfig['gpt_3_5_turbo'].name,
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
                'You are a helpful assistant. Your task is generate a very detailed summary of a given text in a comprehensive, educational way.',
            },
            {
              role: 'user',
              content: `Youtube video transcript: ### ${text} ###`,
            },
          ],
        });

        const data = zodParseJSON(Schema)(
          result?.completion?.choices?.[0]?.message?.tool_calls?.[0]?.function
            ?.arguments as string
        );

        await prisma.lLMTaskOutput.create({
          data: {
            externalId: videoId,
            type,
            output: {
              en: {
                title: 'YouTube video title',
                description: 'YouTube video description',
                ...data,
              },
            },
          },
        });

        return data;
      }

    default:
      throw new Error('Unsupported use case.');
  }
};

handler.post(
  validate({
    handler: respond(queryFreeTools),
    body: schema,
  })
);

export default async function wrapper(
  req: AppNextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
