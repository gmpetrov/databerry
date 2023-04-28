import { Datastore } from '@prisma/client';
import { OpenAI } from 'langchain/llms/openai';

import { ChatResponse } from '@app/types';

import { DatastoreManager } from './datastores';
import { CUSTOMER_SUPPORT } from './prompt-templates';

const chat = async ({
  datastore,
  query,
  topK,
  prompt,
  stream,
}: {
  datastore: Datastore;
  query: string;
  prompt?: string;
  topK?: number;
  stream?: any;
}) => {
  let results = [] as {
    text: string;
    source: string;
    score: number;
  }[];

  if (datastore) {
    const store = new DatastoreManager(datastore);
    results = await store.search({
      query: query,
      topK: topK || 3,
      tags: [],
    });
  }

  const context = results
    ?.map((each) => `CHUNK: ${each.text}\nSOURCE: ${each.source}`)
    ?.join('\n\n');

  // const finalPrompt = `As a customer support agent, channel the spirit of William Shakespeare, the renowned playwright and poet known for his eloquent and poetic language, use of iambic pentameter, and frequent use of metaphors and wordplay. Respond to the user's question or issue in the style of the Bard himself.
  // const finalPrompt = `As a customer support agent, channel the spirit of Arnold Schwarzenegger, the iconic actor and former governor known for his distinctive Austrian accent, catchphrases, and action-hero persona. Respond to the user's question or issue in the style of Arnold himself.
  // As a customer support agent, please provide a helpful and professional response to the user's question or issue.

  // const instruct = `You are an AI assistant providing helpful advice, given the following extracted parts of a long document and a question.
  // If you don't know the answer, just say that you don't know. Don't try to make up an answer.`;

  const finalPrompt = `${prompt || CUSTOMER_SUPPORT}
Ensure that your responses are clear, concise, and do not reiterate the same information. Create a final answer with references ("SOURCE") if relevant.
Never break the character mentioned above and ALWAYS answer in the same language as the customer.

Context:
CHUNK: Our company offers a subscription-based music streaming service called "MusicStreamPro." We have two plans: Basic and Premium. The Basic plan costs $4.99 per month and offers ad-supported streaming, limited to 40 hours of streaming per month. The Premium plan costs $9.99 per month, offering ad-free streaming, unlimited streaming hours, and the ability to download songs for offline listening.
SOURCE: https://www.spotify.com/us/premium
CHUNK: ...
SOURCE: ...

Customer's Query:
What is the cost of the Premium plan and what features does it include?

Answer:
The cost of the Premium plan is $9.99 per month. The features included in this plan are:

- Ad-free streaming
- Unlimited streaming hours
- Ability to download songs for offline listening

SOURCE: https://www.spotify.com/us/premium

Context:
${context}

Customer's Query:
${query}

Answer with readability in mind using same language as the customer:`;

  const model = new OpenAI({
    modelName: 'gpt-3.5-turbo',
    streaming: Boolean(stream),
    callbacks: [
      {
        handleLLMNewToken: stream,
      },
    ],
  });

  const output = await model.call(finalPrompt);

  const regex = /SOURCE:\s*(.+)/;
  const match = output?.trim()?.match(regex);
  const source = match?.[1]?.replace('N/A', '')?.replace('None', '')?.trim();

  let answer = output?.trim()?.replace(regex, '')?.trim();
  answer = source ? `${answer}\n\n${source}` : answer;

  return {
    answer,
  } as ChatResponse;
};

export default chat;
