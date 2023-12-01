import { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import { ChatCompletionTool } from 'openai/resources';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import zodParseJSON from '../zod-parse-json';

export const Schema = z.object({
  chapters: z
    .array(
      z.object({
        title: z.string().describe('Title of the chapter in english'),
        summary: z.string().describe('Summary of the chapter in english'),
        offset: z
          .string()
          .describe(
            'Offset in the video where the chapter starts. Format: 42s'
          ),
      })
    )
    .describe(
      'Summaries by order of appearance of all topics discussed. Make sure you go through all of them.'
    ),
  // videoSummary: z
  //   .string()
  //   .describe(
  //     `Very engaging summary of the video that highlights key informations structed with bullet points when possible`
  //   ),
  // thematics: z.array(z.string()),
});

export type Schema = z.infer<typeof Schema>;

const tool = {
  type: 'function',
  function: {
    name: 'youtube_summary',
    description:
      'Extract thoroughly all chapters from a given youtube video transcript from the beginning to the end.',
    parameters: zodToJsonSchema(Schema),
    parse: zodParseJSON(Schema),
    function: (data: z.infer<typeof Schema>) => data,
  },
} as ChatCompletionTool;

export default tool;
