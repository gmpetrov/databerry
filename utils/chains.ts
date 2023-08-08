import { Agent, Datastore, MessageFrom, Tool, ToolType } from '@prisma/client';
import axiosMod, { AxiosRequestConfig, AxiosStatic } from 'axios';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AgentExecutor, ZeroShotAgent } from 'langchain/agents';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from 'langchain/schema';
import { Tool as LangchainTool } from 'langchain/tools';
import { WebBrowser } from 'langchain/tools/webbrowser';

import { SSE_EVENT } from '@app/types';
import { Source } from '@app/types/document';
import { ChatRequest } from '@app/types/dtos';

import { getTextFromHTML, loadPageContent } from './loaders/web-page';
import chat from './chat';
import splitTextByToken from './split-text-by-token';
import streamData from './stream-data';

type ToolExtended = Tool & {
  datastore: Datastore | null;
};

export type AgentWithTools = Agent & {
  tools: ToolExtended[];
};

const qaPrompt = `
INSTRUCTIONS: Given the following extracted parts of a long document and a question, create a final answer using ONLY THE GIVEN DOCUMENT DATA NOT FROM YOUR TRAINED KNOWLEDGE BASE in the language the question is asked, if it's asked in English, answer in English and so on. If you can't fetch a proper answer from the GIVEN DATA then just say that you don't know the answer from the document. Don't try to give an answer like a search engine for everything. Give an answer as much as it is asked for. Be specific to the question and don't give full explanation with long answer all the time unless asked explicitly or highly relevant. When asked for how many, how much etc, try giving the quantifiable answer without giving the full lengthy explanation. Always answer in the same language the question is asked in. Give the answer in proper line breaks between paragraphs or sentences.

CONTEXT:
{context}

Question: {query}
Give answer in the markdown rich format with proper headlines, bold, italics etc as per heirarchy and readability requirements. Make sure you follow all the given INSTRUCTIONS strictly when giving the answer with care. Do not answer like a generic AI, but act like a trained AI to answer questions based on the only info provided in the above CONTEXT sections.
Helpful Answer:
`;

const googleSearch = async (query: string) => {
  const url = `https://www.google.com/search?q=${encodeURI(query)}`;

  const page = await loadPageContent(
    url.startsWith('http') ? url : `https://${url}`
  );

  const { load } = await import('cheerio');

  const $ = load(page);
  // const links = $(`div[data-async-context] a[ping][href]`);
  const links = $(`body a[href]`);

  const hrefs = [] as string[];
  links.each((index, value) => {
    const h = $(value).attr('href');
    if (h && h.startsWith('/url?q=')) {
      hrefs.push(decodeURIComponent(h.replace('/url?q=', '')));
    }
  });

  return hrefs;
};

export default class ChainManager {
  constructor({}: {}) {}

  async query({
    input,
    stream,
    history,
    truncateQuery,
    temperature,
    filters,
    promptType,
    promptTemplate,
    httpResponse,
    abortController,
  }: {
    input: string;
    stream?: any;
    history?: { from: MessageFrom; message: string }[] | undefined;
    truncateQuery?: boolean;
    temperature?: ChatRequest['temperature'];
    filters?: ChatRequest['filters'];
    promptType?: ChatRequest['promptType'];
    promptTemplate?: ChatRequest['promptTemplate'];
    httpResponse?: any;
    abortController?: any;
  }) {
    if (filters?.datasource_ids?.length || filters?.datastore_ids?.length) {
      const { answer, sources } = await chat({
        modelName: 'gpt_3_5_turbo_16k',
        promptType: 'raw',
        promptTemplate: qaPrompt,
        query: input,
        topK: 15,
        temperature: 0,
        stream,
        history,
        truncateQuery,
        filters,
        includeSources: true,
      });

      return { answer, sources };
    }

    const model = new ChatOpenAI({
      // modelName: 'gpt-4',
      modelName: 'gpt-3.5-turbo',
      temperature: temperature || 0.5,
      streaming: Boolean(stream),
      callbacks: [
        {
          handleLLMNewToken: stream,
          // handleToolEnd: () => {
          //   console.log('handleToolEnd');
          // },
          // handleLLMError: () => {
          //   console.log('handleLLMError');
          // },
        },
      ],
    });

    const messages = [
      new SystemChatMessage(`You are a productivity assistant.
Please provide a helpful and professional response to the user's question or issue.
      `),
      // ...(history?.map((m) => {
      //   if (m.from === MessageFrom.agent) {
      //     return new AIChatMessage(m.message);
      //   }
      //   return new HumanChatMessage(m.message);
      // }) || []),
      new HumanChatMessage(input),
    ];

    const res = await model.call(messages, {
      signal: abortController.signal,
      // functions: [
      //   {
      //     name: 'web_search',
      //     description:
      //       'Search the web when task or question requires access to the internet',
      //     parameters: {
      //       type: 'object',
      //       properties: {
      //         url: {
      //           type: 'string',
      //         },
      //         taskSummary: {
      //           type: 'string',
      //           description: 'Summary of the task',
      //         },
      //         lang: {
      //           type: 'string',
      //           description: 'language of the query',
      //         },
      //         defaultAnswer: {
      //           type: 'string',
      //           description: 'The answer to use as a fallback',
      //         },
      //       },
      //       required: ['taskSummary', 'lang', 'defaultAnswer'],
      //     },
      //   },
      // ],
    });

    const fCall = res?.additional_kwargs?.function_call;

    let answer = res.text;
    let _url = '';

    if (fCall?.name === 'web_search') {
      const { taskSummary, url, defaultAnswer } = JSON.parse(
        fCall?.arguments || `{}`
      ) as {
        taskSummary: string;
        url?: string;
        defaultAnswer: string;
      };

      _url = url || '';

      if (!url) {
        if (stream) {
          streamData({
            res: httpResponse,
            event: SSE_EVENT.step,
            data: `Searching the web for "${taskSummary}" ...\n`,
          });
        }

        const hrefs = await googleSearch(taskSummary);

        _url = hrefs?.[0];
      }

      if (_url) {
        const htmlSTR = await loadPageContent(
          _url.startsWith('http') ? _url : `https://${_url}`
        );
        const text = await getTextFromHTML(htmlSTR);

        const chunks = await splitTextByToken({
          text,
          chunkSize: 3000,
        });

        const out = await model.call([
          ...messages,
          new HumanChatMessage(
            `${chunks[0]}`
            // `${input}\n${chunks[0]}\nAlso provide up to 5 markdown links from the text above that would be of interest (always including URL and text). Links should be provided, if present, in markdown syntax as a list under the heading "Relevant Links:".`
          ),
        ]);
        answer = out.text;
      } else {
        answer = defaultAnswer;
        if (answer && stream) {
          stream(answer);
        }
      }
    }

    return {
      answer: answer,
      // answer: output,
      sources: [
        ...(_url
          ? [
              {
                datasource_name: _url,
                source_url: _url,
              } as Source,
            ]
          : []),
      ],
    };
  }
}
