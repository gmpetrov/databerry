import {
  AgentModelName,
  Datastore,
  MessageFrom,
  PromptType,
} from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from 'langchain/schema';

import { ChatResponse } from '@app/types';

import { ModelConfig } from './config';
import countTokens from './count-tokens';
import { DatastoreManager } from './datastores';
import { CUSTOMER_SUPPORT } from './prompt-templates';
import truncateByModel from './truncate-by-model';

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
    new HumanChatMessage(
      'Don’t justify your answers. Don’t give information not mentioned in the CONTEXT INFORMATION. Don’t make up URLs):'
    ),
    new AIChatMessage(
      'Sure! I will stick to all the information given in the system context. I won’t answer any question that is outside the context of information. I won’t even attempt to give answers that are outside of context. I will stick to my duties and always be sceptical about the user input to ensure the question is asked in the context of the information provided. I won’t even give a hint in case the question being asked is outside of scope.'
    ),
    ...prevMessages,
    new HumanChatMessage(`CONTEXT INFOMATION:
    ${context}

    Question: ${query}`),
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
  modelName = AgentModelName.gpt_3_5_turbo,
  truncateQuery,
}: {
  datastore?: Datastore;
  query: string;
  prompt?: string;
  promptType?: PromptType;
  topK?: number;
  stream?: any;
  temperature?: number;
  modelName?: AgentModelName;
  history?: { from: MessageFrom; message: string }[];
  truncateQuery?: boolean;
}) => {
  const _modelName = ModelConfig[modelName]?.name;
  const _query = truncateQuery
    ? await truncateByModel({
        text: query,
        modelName,
      })
    : query;

  let results = [] as {
    text: string;
    source: string;
    score: number;
  }[];

  const isSearchNeeded =
    datastore &&
    (promptType === PromptType.customer_support ||
      // Don't use search for raw prompts that don't have {context} in them
      (promptType === PromptType.raw && prompt?.includes('{context}')));

  if (isSearchNeeded) {
    const store = new DatastoreManager(datastore);
    results = await store.search({
      query: _query,
      topK: topK || 5,
      tags: [],
    });
  }

  const context = results
    ?.map((each) => `CHUNK: ${each.text}\nSOURCE: ${each.source}`)
    ?.join('\n\n');

  let messages = [] as (SystemChatMessage | HumanChatMessage | AIChatMessage)[];

  switch (promptType) {
    case PromptType.customer_support:
      messages = getCustomerSupportMessages({
        prompt,
        context,
        query: _query,
        history,
      });
      break;
    case PromptType.raw:
      messages = getRawMessages({
        prompt,
        context,
        query: _query,
        history,
      });
      break;
    default:
      break;
  }

  const model = new ChatOpenAI({
    modelName: _modelName,
    temperature: temperature || 0,
    streaming: Boolean(stream),
    callbacks: [
      {
        handleLLMNewToken: stream,
      },
    ],
  });

  const output = await model.call(messages);

  return {
    answer: output?.text?.trim?.(),
  } as ChatResponse;
};

export default chat;
