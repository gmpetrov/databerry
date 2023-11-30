import ytTool, { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import { AgentModelName } from '@chaindesk/prisma';

import ChatModel from './chat-model';
import { ModelConfig } from './config';
import splitTextByToken from './split-text-by-token';
import YoutubeApi from './youtube-api';
import zodParseJSON from './zod-parse-json';

export default async function ytSummarize(url: string) {
  const transcripts = await YoutubeApi.transcribeVideo(url);

  const text = transcripts.reduce((acc, { text }) => acc + text, '');

  const [chunkedText] = await splitTextByToken({
    text,
    chunkSize: ModelConfig[AgentModelName.gpt_3_5_turbo].maxTokens * 0.7,
  });

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
        content: `Youtube video transcript: ### ${chunkedText} ###`,
      },
    ],
  });

  return zodParseJSON(Schema)(
    result?.completion?.choices?.[0]?.message?.tool_calls?.[0]?.function
      ?.arguments as string
  );
}
