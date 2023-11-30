import { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import { ChatCompletionTool } from 'openai/resources';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import zodParseJSON from '../zod-parse-json';

export const Schema = z.object({
  chapters: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        offset: z
          .string()
          .describe(
            'Begining of the chapter in seconds. This is useful to jump to the chapter in the video: e.g. 42s'
          ),
      })
    )
    .describe(
      'Detailed list of all chapters extracted from the video transcript in sorted in order of appearance in the transcript from the beginning to the end of the video.'
    ),
  videoSummary: z
    .string()
    .describe(
      `Useful summary containing true informations only about the main points of the topic. It has bullet points to list important details, and finishes with a concluding sentence`
    ),
  thematics: z.array(z.string()),
});

export type Schema = z.infer<typeof Schema>;

const tool = {
  type: 'function',
  function: {
    name: 'youtube_summary',
    description: 'Generates a detailed summary of a youtube video transcript.',
    parameters: zodToJsonSchema(Schema),
    parse: zodParseJSON(Schema),
    function: (data: z.infer<typeof Schema>) => data,
  },
} as ChatCompletionTool;

export default tool;
