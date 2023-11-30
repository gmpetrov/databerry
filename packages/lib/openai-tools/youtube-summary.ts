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
            'time position in seconds where the chapter starts e.g: "42s"'
          ),
      })
    )
    .describe(
      'all chapters or topics mentionned in the conversation in chronological order'
    ),
  videoSummary: z
    .string()
    .describe(
      "The video's summary in rich markdown format with proper bolds, italics etc as per heirarchy and readability requirements."
    ),
  thematics: z.array(z.string()),
});

export type Schema = z.infer<typeof Schema>;

const tool = {
  type: 'function',
  function: {
    name: 'youtube_summary',
    description:
      'Generate a structured summary for a youtube video with summary by chatpers and timecode for each chapter.',
    parameters: zodToJsonSchema(Schema),
    parse: zodParseJSON(Schema),
    function: (data: z.infer<typeof Schema>) => data,
  },
} as ChatCompletionTool;

export default tool;
