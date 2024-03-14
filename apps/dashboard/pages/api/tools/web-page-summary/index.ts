import { load } from 'cheerio';
import cuid from 'cuid';
import { NextApiResponse } from 'next';
import pMap from 'p-map';
import { z, ZodSchema } from 'zod';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import ChatModel from '@chaindesk/lib/chat-model';
import { ModelConfig } from '@chaindesk/lib/config';
import countTokens from '@chaindesk/lib/count-tokens';
import {
  createLazyAuthHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { loadPageContent } from '@chaindesk/lib/loaders/web-page';
import cors from '@chaindesk/lib/middlewares/cors';
import pipe from '@chaindesk/lib/middlewares/pipe';
import rateLimit from '@chaindesk/lib/middlewares/rate-limit';
import splitTextByToken from '@chaindesk/lib/split-text-by-token';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { WebPageSummarySchema } from '@chaindesk/lib/types/dtos';
import validate from '@chaindesk/lib/validate';
import { generateId } from '@chaindesk/lib/web-page-summarizer';
import { AgentModelName, LLMTaskOutputType, Prisma } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

const handler = createLazyAuthHandler();

export const getLatestVideos = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const outputs = await prisma.lLMTaskOutput.findMany({
    where: {
      type: LLMTaskOutputType.web_page_summary,
    },
    take: 3,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return outputs;
};

handler.get(respond(getLatestVideos));

export const createWebPageSummary = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const isAuthenticated =
    req.headers['api-key'] === process.env.NEXTAUTH_SECRET;

  if (!isAuthenticated) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  const refresh =
    req.query.refresh === 'true' &&
    req?.session?.roles?.includes?.('SUPERADMIN');
  const { url, date } = WebPageSummarySchema.parse(req.body);

  const { host } = new URL(url);

  const externalId = await generateId(url);

  const found = await prisma.lLMTaskOutput.findUnique({
    where: {
      unique_external_id: {
        type: LLMTaskOutputType.web_page_summary,
        externalId,
      },
    },
  });

  if (found) {
    return found;
  } else {
    // if (isAuthenticated) {
    //   await rateLimit({
    //     duration: 60,
    //     limit: 2,
    //   })(req, res);
    // }

    // if (process.env.NODE_ENV === 'production' && !refresh) {
    //   // Trick to bypass cloudflare 100s timeout limit
    //   res.json({ processing: true });
    // }

    const content = await loadPageContent(url);

    const $ = load(content);

    const title = $('meta[name="title"]').attr('content') || $('title').text();
    const metadata = {
      title,
      description: $('meta[name="description"]').attr('content'),
      ogImage: $('meta[property="og:image"]').attr('content'),
      host: host,
      url,
    };

    $('head').remove();
    $('footer').remove();
    $('header').remove();
    $('nav').remove();
    $('script').remove();
    $('style').remove();
    $('link').remove();
    $('svg').remove();
    $('img').remove();
    $('noscript').remove();

    const body = $('body').html();

    if (!metadata.title || !metadata.description || !body) {
      throw new Error('Failed to fetch metadata for the web page.');
    }

    const modelName = AgentModelName.gpt_3_5_turbo;

    const model = new ChatModel();

    const chunks = await splitTextByToken({
      text: body,
      chunkSize: ModelConfig[modelName].maxTokens * 0.5,
    });

    const run = async (chunkedText: string, index: number) => {
      const summaryCall = await model.call({
        model: ModelConfig[modelName].name,
        response_format: {
          type: 'json_object',
        },
        messages: [
          {
            role: 'system',
            content: `Generate an english summary for a given section of web page. 
            Do not mention that is is a summary, but rather present it as a continuation of the content.

            Answer a JSON object with the following structure:
            {
              "title": "Section Title",
              "summary": "Section Summary"
            }

            Do not includes the part number or section number or the idea of summary in the title (don't generate titles like: "Part 1: ..."), bur rather use a title related to the content of the section.

            Format the summary value in markdown format to display the content in a nice and aerated way.
            `,
          },
          {
            role: 'user',
            content: `Chunk ${index + 1}/${
              chunks.length + 1
            }: ### ${chunkedText} ### Summary: `,
          },
        ],
      });
      const summary = summaryCall?.completion?.choices?.[0]?.message?.content;

      return summary;
    };

    const results = await pMap(chunks, run, { concurrency: chunks.length });
    const summaries = results
      .map((each) => {
        try {
          return JSON.parse(each || '') as { title: string; summary: string };
        } catch {
          return null;
        }
      })
      .filter((each) => !!each);

    if (summaries.length === 0) {
      throw new Error('Failed to generate summaries for the web page.');
    }

    const summaryText = summaries.map((each) => `${each?.summary}`).join('\n');

    const faqCall = await model.call({
      response_format: {
        type: 'json_object',
      },
      model: ModelConfig[modelName].name,
      messages: [
        {
          role: 'system',
          content: `Generate a json array of useful questions and answers, focused on the underlying subject for a given essai.
          <output-example>
            {
              "questions": [{ "q": "What is nuclear fusion?", "a": "Nuclear fusion is the process by which two light atomic nuclei combine to form a single heavier one while releasing massive amounts of energy" }]
            }
          <output-example>
          `,
        },
        {
          role: 'user',
          content: `Essai: ### ${summaryText} ### Generate a list of questions and answers focused on the underlying subject: `,
        },
      ],
    });

    const faqSTR = faqCall?.completion?.choices?.[0]?.message?.content;
    let faq = [];

    try {
      faq = JSON.parse(faqSTR || '{}')?.questions || [];
    } catch {}

    const payload = {
      createdAt: date ? new Date(date) : undefined,
      externalId,
      type: 'web_page_summary',
      output: {
        metadata: {
          ...metadata,
        },
        en: {
          chapters: summaries,
          faq,
        },
      },
    } as Prisma.LLMTaskOutputCreateArgs['data'];

    const output = await prisma.lLMTaskOutput.upsert({
      where: {
        unique_external_id: {
          type: LLMTaskOutputType.web_page_summary,
          externalId,
        },
      },
      create: payload,
      update: payload,
    });

    req.logger.info(`Finished processing web page url ${url}`);

    return output;
  }
};

handler.post(
  pipe(
    validate({
      handler: respond(createWebPageSummary),
      body: WebPageSummarySchema,
    })
  )
);

export default pipe(cors({ methods: ['GET', 'POST', 'HEAD'] }), handler);
