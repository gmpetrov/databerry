import { Datastore, MessageFrom, PromptType } from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from 'langchain/schema';

import { ChatResponse } from '@app/types';

import { DatastoreManager } from './datastores';
import { CUSTOMER_SUPPORT } from './prompt-templates';

const getCustomerSupportPrompt = ({
  prompt,
  query,
  context,
}: {
  prompt?: string;
  query: string;
  context: string;
}) => {
  return `Given a following extracted chunks of a long document, create a final answer in the same language in which the question is asked, with references ("SOURCES"). 
If you don't know the answer, politely say that you don't know. Don't try to make up an answer.
Create a final answer with references ("SOURCE") if any, never translate SOURCES and ulrs.

${prompt || CUSTOMER_SUPPORT}

Example:
=======
CONTEXT INFOMATION:
CHUNK: Our company offers a subscription-based music streaming service called "MusicStreamPro." We have two plans: Basic and Premium. The Basic plan costs $4.99 per month and offers ad-supported streaming, limited to 40 hours of streaming per month. The Premium plan costs $9.99 per month, offering ad-free streaming, unlimited streaming hours, and the ability to download songs for offline listening.
SOURCE: https://www.spotify.com/us/premium

Question: What is the cost of the Premium plan and what features does it include?

Answer: The cost of the Premium plan is $9.99 per month. The features included in this plan are:
- Ad-free streaming
- Unlimited streaming hours
- Ability to download songs for offline listening

SOURCE: https://www.spotify.com/us/premium
=======

CONTEXT INFOMATION:
${context}
`;
};

type GetPromptProps = {
  context: string;
  query: string;
  prompt?: string;
  history?: { from: MessageFrom; message: string }[];
};

const getCustomerSupportMessages = ({
  context,
  query,
  prompt,
  history,
}: GetPromptProps) => {
  const systemPrompt = getCustomerSupportPrompt({
    prompt,
    query,
    context,
  });

  const prevMessages = (history || [])?.map((each) => {
    if (each.from === MessageFrom.human) {
      return new HumanChatMessage(each.message);
    }
    return new AIChatMessage(each.message);
  });

  return [
    new SystemChatMessage(systemPrompt),
    // ...messages,
    new HumanChatMessage(
      'Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION. Don’t make up URLs):'
    ),
    new AIChatMessage(
      'Sure! I will stick to all the information given in the system context. I won’t answer any question that is outside the context of information. I won’t even attempt to give answers that are outside of context. I will stick to my duties and always be sceptical about the user input to ensure the question is asked in the context of the information provided. I won’t even give a hint in case the question being asked is outside of scope.'
    ),
    ...prevMessages,
    new HumanChatMessage(query),
  ];
};

const getRawMessages = ({
  context,
  query,
  prompt,
  history,
}: GetPromptProps) => {
  const finalPrompt = prompt!
    ?.replace('{query}', query)
    ?.replace('{context}', context);

  const prevMessages = (history || [])?.map((each) => {
    if (each.from === MessageFrom.human) {
      return new HumanChatMessage(each.message);
    }
    return new AIChatMessage(each.message);
  });

  return [...prevMessages, new HumanChatMessage(finalPrompt)];
};

const chat = async ({
  datastore,
  query,
  topK,
  prompt,
  promptType,
  stream,
  temperature,
  history,
}: {
  datastore: Datastore;
  query: string;
  prompt?: string;
  promptType?: PromptType;
  topK?: number;
  stream?: any;
  temperature?: number;
  history?: { from: MessageFrom; message: string }[];
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

  let messages = [] as (SystemChatMessage | HumanChatMessage | AIChatMessage)[];

  switch (promptType) {
    case PromptType.customer_support:
      messages = getCustomerSupportMessages({
        prompt,
        context,
        query,
        history,
      });
      break;
    case PromptType.raw:
      messages = getRawMessages({
        prompt,
        context,
        query,
        history,
      });
      break;
    default:
      break;
  }

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-0613',
    temperature: temperature || 0,
    streaming: Boolean(stream),
    callbacks: [
      {
        handleLLMNewToken: stream,
      },
    ],
  });

  // Disable conversation history for now as it conflict with wrapped prompt
  // const messages = (history || [])?.map((each) => {
  //   if (each.from === MessageFrom.human) {
  //     return new HumanChatMessage(each.message);
  //   }
  //   return new AIChatMessage(each.message);
  // });

  const output = await model.call(messages);

  return {
    answer: output?.text?.trim?.(),
  } as ChatResponse;
};

export default chat;
