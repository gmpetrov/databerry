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
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { Tool as LangchainTool } from 'langchain/tools';
import { WebBrowser } from 'langchain/tools/webbrowser';

import { SSE_EVENT } from '@chaindesk/lib/types';
import { Source } from '@chaindesk/lib/types/document';
import { ChatRequest } from '@chaindesk/lib/types/dtos';
import {
  Agent,
  Datastore,
  Form,
  Message,
  MessageFrom,
  Tool,
  ToolType,
} from '@chaindesk/prisma';

import streamData from '..//stream-data';
import chat from '../chatv2';
import { getTextFromHTML, loadPageContent } from '../loaders/web-page';
import splitTextByToken from '../split-text-by-token';

import chatRetrieval from './chat-retrieval';
import qa from './qa';

type ToolExtended = Tool & {
  datastore: Datastore | null;
  form: Form | null;
};

export type AgentWithTools = Agent & {
  tools: ToolExtended[];
};

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
  constructor({}) {}

  async query({
    input,
    stream,
    history,
    temperature,
    filters,
    httpResponse,
    abortController,
  }: {
    input: string;
    stream?: any;
    history?: Message[] | undefined;
    temperature?: ChatRequest['temperature'];
    filters?: ChatRequest['filters'];
    systemPrompt?: ChatRequest['systemPrompt'];
    userPrompt?: ChatRequest['userPrompt'];
    httpResponse?: any;
    abortController?: any;

    promptType?: ChatRequest['promptType'];
    promptTemplate?: ChatRequest['promptTemplate'];
  }) {
    if (filters?.datasource_ids?.length || filters?.datastore_ids?.length) {
      return qa({
        query: input,
        temperature,
        stream,
        history,
        filters,
        abortController,
      });
    }

    return chat({
      initialMessages: [
        {
          role: 'system',
          content: `You are a productivity assistant. Please provide a helpful and professional response to the user's question or issue.`,
        },
        // new SystemMessage(
        //   `You are a productivity assistant. Please provide a helpful and professional response to the user's question or issue.`
        // ),
      ],
      prompt: input,
      temperature: temperature || 0.5,
      stream,
      abortController,
    });

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
      new SystemMessage(`You are a productivity assistant.
Please provide a helpful and professional response to the user's question or issue.
      `),
      // ...(history?.map((m) => {
      //   if (m.from === MessageFrom.agent) {
      //     return new AIMessage(m.message);
      //   }
      //   return new HumanMessage(m.message);
      // }) || []),
      new HumanMessage(input),
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
          new HumanMessage(
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
