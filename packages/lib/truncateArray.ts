import { ChatCompletionMessageParam } from 'openai/resources';

import { countTokensEstimation } from './count-tokens';
import splitTextByToken from './split-text-by-token';

export default async function truncateArray<T>({
  items,
  maxTokens,
  getText,
  setText,
}: {
  items: T[];
  maxTokens: number;
  getText: (item: T) => string;
  setText: (item: T, text: string) => T;
}) {
  const messagesWithinTokenLimit: T[] = [];
  let currentTokenCount = 0;

  for (const each of items) {
    const messageTokens = countTokensEstimation({
      text: getText(each) as string,
    });

    if (currentTokenCount + messageTokens <= maxTokens) {
      messagesWithinTokenLimit.push(each);
      currentTokenCount += messageTokens;
    } else {
      const remainingTokens = maxTokens - currentTokenCount;

      if (remainingTokens > 0) {
        const chunks = await splitTextByToken({
          text: getText(each) as string,
          chunkSize: remainingTokens,
        });

        messagesWithinTokenLimit.push(setText(each, chunks[0]));
      }

      return messagesWithinTokenLimit;
    }
  }

  return messagesWithinTokenLimit;
}
