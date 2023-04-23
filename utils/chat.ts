import { Datastore } from '@prisma/client';
import { OpenAI } from 'langchain/llms/openai';

import { ChatResponse } from '@app/types';

import { DatastoreManager } from './datastores';

const chat = async ({
  datastore,
  query,
  topK,
  prompt,
}: {
  datastore: Datastore;
  query: string;
  prompt?: string;
  topK?: number;
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

  const instruct = `You are an AI assistant providing helpful advice. Given the following extracted parts of a long document and a question. 
  If you don't know the answer, just say that you don't know. Don't try to make up an answer.`;

  const context = results
    ?.map((each) => `Content: ${each.text}\nSource: ${each.source}`)
    ?.join('\n\n');

  // const finalPrompt = `As a customer support agent, channel the spirit of William Shakespeare, the renowned playwright and poet known for his eloquent and poetic language, use of iambic pentameter, and frequent use of metaphors and wordplay. Respond to the user's question or issue in the style of the Bard himself.
  // const finalPrompt = `As a customer support agent, channel the spirit of Arnold Schwarzenegger, the iconic actor and former governor known for his distinctive Austrian accent, catchphrases, and action-hero persona. Respond to the user's question or issue in the style of Arnold himself.
  // As a customer support agent, please provide a helpful and professional response to the user's question or issue.

  const finalPrompt = `${prompt || instruct}
  Create a final answer with references ("SOURCES")
  If you know the answer, ALWAYS return a "SOURCES" part in your answer otherwise don't.
  ALWAYS ANSWER IN THE SAME LANGUAGE AS THE QUESTION WITHOUT BREAKING THE ROLE MENTIONED ABOVE.
  
  QUESTION: ...
  =========
  Content: ...
  Source: 28-pl
  Content: ...
  Source: http://example.com
  =========
  FINAL ANSWER: ...
  SOURCES: 28-pl

  QUESTION: ...
  =========
  Content: ...
  Source: file.pdf
  Content: ...
  Source: hello.txt
  =========
  FINAL ANSWER: ...
  SOURCES:


  QUESTION: ${query}
  =========
  ${context}
  =========
  FINAL ANSWER:
  `;

  const model = new OpenAI({ modelName: 'gpt-3.5-turbo' });

  const output = await model.call(finalPrompt);

  const regex = /SOURCES:\s*(.+)/;
  const match = output?.trim()?.match(regex);
  const source = match?.[1]?.replace('N/A', '')?.replace('None', '')?.trim();

  let answer = output?.trim()?.replace(regex, '')?.trim();
  answer = source ? `${answer}\n\n${source}` : answer;

  return {
    answer,
  } as ChatResponse;
};

export default chat;
