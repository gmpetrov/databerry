import OpenAIApi from 'openai';

import { ModelConfig } from './config';
import countTokens from './count-tokens';
import splitTextIntoChunks from './split-text-by-token';

const MAX_TOKENS = ModelConfig['gpt_3_5_turbo'].maxTokens * 0.7;

const generateSummary = async ({ text }: { text: string }) => {
  const openai = new OpenAIApi();

  const totalTokens = countTokens({ text });

  let chunkedText = text;
  if (totalTokens > MAX_TOKENS) {
    const chunks = await splitTextIntoChunks({
      text,
      chunkSize: MAX_TOKENS,
    });

    chunkedText = chunks[0];
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Your task is to summarize text in a comprehensive, educational way.',
        },
        {
          role: 'user',
          content: `Please summarize the following text: ${chunkedText}`,
        },
      ],
    });
    return {
      summary: response.choices?.[0]?.message?.content,
    };
  } catch (error) {
    return {
      error: { message: 'An error occurred while generating summary.' },
    };
  }
};

export default generateSummary;
