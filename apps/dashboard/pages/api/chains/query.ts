import Cors from 'cors';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import runMiddleware from '@chaindesk/lib/run-middleware';
import generateSummary from '@chaindesk/lib/summarize';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import validate from '@chaindesk/lib/validate';
import YoutubeApi from '@chaindesk/lib/youtube-api';
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
          summary: (found.output as any)?.['en']?.summary,
        };
      } else {
        const transcripts = await YoutubeApi.transcribeVideo(url);

        const text = transcripts.reduce((acc, { text }) => acc + text, '');

        const { summary, error } = await generateSummary({ text });

        if (error) {
          throw new Error(error.message);
        }

        await prisma.lLMTaskOutput.create({
          data: {
            externalId: videoId,
            type,
            output: {
              en: {
                summary,
              },
            },
          },
        });

        return {
          summary,
        };
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
