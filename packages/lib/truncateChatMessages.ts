import { ChatCompletionMessageParam } from 'openai/resources';

import truncateArray from './truncateArray';

export default async function truncateChatMessages({
  messages,
  maxTokens,
}: {
  messages: ChatCompletionMessageParam[];
  maxTokens: number;
}) {
  return truncateArray<ChatCompletionMessageParam>({
    items: messages,
    maxTokens,
    getText: (item) => item.content as string,
    setText: (item, text) => {
      return {
        ...item,
        content: text,
      };
    },
  });
}
