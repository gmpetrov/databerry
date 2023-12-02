import { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import { ChatCompletionTool } from 'openai/resources';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import zodParseJSON from '../zod-parse-json';

export const Schema = z.object({
  chapters: z
    .array(
      z.object({
        title: z
          .string()
          .describe(
            "Title of the chapter in english. It should be short and concise and give a good idea of what the chapter is about. It can't be call Chapter 1, Chapter 2, etc."
          ),
        summary: z
          .string()
          .describe('Detailed summary with key insights. In english.'),
        offset: z
          .string()
          .describe(
            'Offset in the video where the chapter starts. Format: 42s.'
          ),
      })
    )
    .describe(
      'Identified Chapters by order of appearance. It is an array of objects with the following properties: title, summary, offset.'
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
    description: 'Extract chapters from a given youtube video transcript.',
    parameters: zodToJsonSchema(Schema),
    parse: zodParseJSON(Schema),
    function: (data: z.infer<typeof Schema>) => data,
  },
} as ChatCompletionTool;

export default tool;
