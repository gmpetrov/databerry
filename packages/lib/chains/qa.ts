import createPromptContext from '../create-prompt-context';
import promptInject from '../prompt-inject';

import chatRetrieval, { ChatRetrievalChainProps } from './chat-retrieval';

export const QA_PROMPT = `
INSTRUCTIONS: Given the following extracted parts of a long document and a question, create a final answer using ONLY THE GIVEN DOCUMENT DATA NOT FROM YOUR TRAINED KNOWLEDGE BASE in the language the question is asked, if it's asked in English, answer in English and so on. If you can't fetch a proper answer from the GIVEN DATA then just say that you don't know the answer from the document. Don't try to give an answer like a search engine for everything. Give an answer as much as it is asked for. Be specific to the question and don't give full explanation with long answer all the time unless asked explicitly or highly relevant. When asked for how many, how much etc, try giving the quantifiable answer without giving the full lengthy explanation. Always answer in the same language the question is asked in. Give the answer in proper line breaks between paragraphs or sentences.

CONTEXT:
{context}

Question: {query}

Give answer in the markdown rich format with proper headlines, bold, italics etc as per heirarchy and readability requirements. Make sure you follow all the given INSTRUCTIONS strictly when giving the answer with care. Do not answer like a generic AI, but act like a trained AI to answer questions based on the only info provided in the above CONTEXT sections.
If you don't find an answer from the CONTEXT, politely say that you don't know. Don't try to make up an answer.
Answer in the same language the question is asked in.
Helpful Answer:
`;

export type QAChainProps = Omit<ChatRetrievalChainProps, 'getPrompt'> & {
  query: string;
};

const qa = async ({
  query,
  temperature,
  topK,
  stream,
  history,
  filters,
  abortController,
}: QAChainProps) => {
  return chatRetrieval({
    modelName: 'gpt_3_5_turbo_16k',
    retrievalSearch: query,
    getPrompt(chunks) {
      return promptInject({
        template: QA_PROMPT,
        query: query,
        context: createPromptContext(chunks),
      });
    },
    topK: topK || 15,
    temperature: temperature || 0,
    stream,
    history,
    filters,
    includeSources: true,
    abortController,
  });
};

export default qa;
