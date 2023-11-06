import type { BaseMessage } from 'langchain/schema';

import countTokens from './count-tokens';
import splitTextByToken from './split-text-by-token';

export default async function truncateChatMessages({
  messages,
  maxTokens,
}: {
  messages: BaseMessage[];
  maxTokens: number;
}) {
  const messagesWithinTokenLimit: BaseMessage[] = [];
  let currentTokenCount = 0;

  for (const message of messages) {
    const messageTokens = countTokens({ text: message.content });

    if (currentTokenCount + messageTokens <= maxTokens) {
      messagesWithinTokenLimit.push(message);
      currentTokenCount += messageTokens;
    } else {
      const remainingTokens = maxTokens - currentTokenCount;

      if (remainingTokens > 0) {
        const chunks = await splitTextByToken({
          text: message.content,
          chunkSize: remainingTokens,
        });

        message.content = chunks[0];
        messagesWithinTokenLimit.push(message);
      }

      return messagesWithinTokenLimit;
    }
  }

  return messagesWithinTokenLimit;
}
