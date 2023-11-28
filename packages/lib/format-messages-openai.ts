import { ChatCompletionMessageParam } from 'openai/resources';

import { Message } from '@chaindesk/prisma';

const formatMessagesOpenAI = (messages: Message[]) => {
  return messages.map((each) => {
    let role = 'user' as ChatCompletionMessageParam['role'];

    if (each.from === 'agent') {
      role = 'assistant';
    }

    return {
      role,
      content: each.text,
    } as ChatCompletionMessageParam;
  });
};

export default formatMessagesOpenAI;
