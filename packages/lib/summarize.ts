import { AgentModelName } from '@chaindesk/prisma';

import ChatModel from './chat-model';
import { ModelConfig } from './config';
import countTokens from './count-tokens';
import splitTextIntoChunks from './split-text-by-token';

const MAX_TOKENS = ModelConfig[AgentModelName.gpt_3_5_turbo].maxTokens * 0.7;

const generateSummary = async ({ text }: { text: string }) => {
  const totalTokens = countTokens({ text });

  let chunkedText = text;
  if (totalTokens > MAX_TOKENS) {
    const chunks = await splitTextIntoChunks({
      text,
      chunkSize: MAX_TOKENS,
    });

    chunkedText = chunks[0];
  }

  const model = new ChatModel({});

  const response = await model.call({
    model: ModelConfig[AgentModelName.gpt_3_5_turbo].name,
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant. Your task is to summarize text in a comprehensive, educational way.',
      },
      {
        role: 'user',
        content: `Text to summarize: ### ${chunkedText} ### Summary in the markdown rich format with proper bolds, italics etc as per heirarchy and readability requirements:`,
      },
    ],
  });

  return {
    summary: response.answer,
  };
};

export default generateSummary;
