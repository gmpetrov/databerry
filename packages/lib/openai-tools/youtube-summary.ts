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
            'Offset in the video where the chapter starts. Format: 42s'
          ),
      })
    )
    .describe(
      'Detailed list of all chapters and topics in the video by chronological order. Useful for a table of contents.'
    ),
  videoSummary: z
    .string()
    .describe(
      `Useful summary in rich markown format. It has bullet points to list keypoints.`
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
