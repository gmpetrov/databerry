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
  return `${prompt || CUSTOMER_SUPPORT}
You must answer questions accurately and truthfully, using the language in which the question is asked.
You are not allowed to use the provided few-shot examples as direct answers. Instead, use your extensive knowledge and understanding of the context to address each inquiry in the most helpful and informative way possible.
Please assist customers with their questions and concerns related to the specific context provided
Ensure that your responses are clear, detailed, and do not reiterate the same information. Create a final answer with references ("SOURCE") if any.

few-shot examples:

START_CONTEXT:
CHUNK: Our company offers a subscription-based music streaming service called "MusicStreamPro." We have two plans: Basic and Premium. The Basic plan costs $4.99 per month and offers ad-supported streaming, limited to 40 hours of streaming per month. The Premium plan costs $9.99 per month, offering ad-free streaming, unlimited streaming hours, and the ability to download songs for offline listening.
SOURCE: https://www.spotify.com/us/premium
CHUNK: ...
SOURCE: ...
END_CONTEXT

START_QUESTION:
What is the cost of the Premium plan and what features does it include?
END_QUESTION

Answer:
The cost of the Premium plan is $9.99 per month. The features included in this plan are:

- Ad-free streaming
- Unlimited streaming hours
- Ability to download songs for offline listening

SOURCE: https://www.spotify.com/us/premium

end few-shot examples.

START_CONTEXT:
${context}
END_CONTEXT

START_QUESTION:
${query}
END_QUESTION

Answer (never translate SOURCES and ulrs):`;
};

const getCustomerSupportPromptWithHistory = ({
  prompt,
  query,
  context,
  history,
}: {
  prompt?: string;
  query: string;
  context: string;
  history: string;
}) => {
  return `${prompt || CUSTOMER_SUPPORT}
You must answer questions accurately and truthfully, using the language in which the question is asked.
You are not allowed to use the provided few-shot examples as direct answers. Instead, use your extensive knowledge and understanding of the context to address each inquiry in the most helpful and informative way possible.
Please assist customers with their questions and concerns related to the specific context provided or the CONVESRATION HISTORY below.
Ensure that your responses are clear, detailed, and do not reiterate the same information. Create a final answer with references ("SOURCE") if any.
If the answer is not in the context, you can also try to use previous message in the conversation history.

few-shot examples:

START_CONTEXT:
CHUNK: Our company offers a subscription-based music streaming service called "MusicStreamPro." We have two plans: Basic and Premium. The Basic plan costs $4.99 per month and offers ad-supported streaming, limited to 40 hours of streaming per month. The Premium plan costs $9.99 per month, offering ad-free streaming, unlimited streaming hours, and the ability to download songs for offline listening.
SOURCE: https://www.spotify.com/us/premium
CHUNK: ...
SOURCE: ...
END_CONTEXT

START_QUESTION:
What is the cost of the Premium plan and what features does it include?
END_QUESTION

Answer:
The cost of the Premium plan is $9.99 per month. The features included in this plan are:

- Ad-free streaming
- Unlimited streaming hours
- Ability to download songs for offline listening

SOURCE: https://www.spotify.com/us/premium

end few-shot examples.

START_CONTEXT:
${context}
END_CONTEXT

START_QUESTION:
${query}
END_QUESTION

Answer (never translate SOURCES and ulrs):`;
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

  let finalPrompt = prompt || '';

  switch (promptType) {
    case PromptType.customer_support:
      let getPrompt =
        (history?.length || 0) > 0
          ? getCustomerSupportPromptWithHistory
          : getCustomerSupportPrompt;
      finalPrompt = getPrompt({
        prompt: finalPrompt,
        query,
        context,
        history: history
          ?.map((each) => `${each.from}: ${each.message}`)
          .join('\n') as string,
      });
      break;
    case PromptType.raw:
      finalPrompt = finalPrompt
        ?.replace('{query}', query)
        ?.replace('{context}', context);
      break;
    default:
      break;
  }

  const model = new ChatOpenAI({
    // modelName: 'gpt-3.5-turbo',
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
  const messages = (history || [])?.map((each) => {
    if (each.from === MessageFrom.human) {
      return new HumanChatMessage(each.message);
    }
    return new AIChatMessage(each.message);
  });

  const output = await model.call([
    new SystemChatMessage(finalPrompt),
    ...messages,
    new HumanChatMessage(query),
    // new HumanChatMessage(finalPrompt),
  ]);

  // const regex = /SOURCE:\s*(.+)/;
  // const match = output?.trim()?.match(regex);
  // const source = match?.[1]?.replace('N/A', '')?.replace('None', '')?.trim();

  // let answer = output?.trim()?.replace(regex, '')?.trim();
  // answer = source ? `${answer}\n\n${source}` : answer;

  return {
    answer: output?.text?.trim?.(),
  } as ChatResponse;
};

export default chat;
