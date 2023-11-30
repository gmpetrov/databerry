import Cors from 'cors';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import runMiddleware from '@chaindesk/lib/run-middleware';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import YoutubeApi from '@chaindesk/lib/youtube-api';
import ytSummarize from '@chaindesk/lib/youtubeSummarizer';
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
      const Youtube = new YoutubeApi();
      const videoId = YoutubeApi.extractVideoId(url);
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
        const data = await ytSummarize(url);

        await prisma.lLMTaskOutput.create({
          data: {
            externalId: videoId,
            type,
            output: {
              metadata: {
                ...videoSnippet,
              },
              en: {
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
