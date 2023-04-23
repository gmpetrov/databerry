import axios from 'axios';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
// import * as yaml from 'js-yaml';
import { initializeAgentExecutor } from 'langchain/agents';
import { createOpenApiAgent, OpenApiToolkit } from 'langchain/agents';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { DynamicTool, JsonObject, JsonSpec, SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { NextApiResponse } from 'next';

import { AppNextApiRequest, AppStatus } from '@app/types';
import {
  createApiHandler,
  createAuthApiHandler,
  respond,
} from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createAuthApiHandler();

export const getStatus = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const account = await prisma.account.findFirst({
    where: {
      userId: req.session.user.id,
      provider: 'google',
    },
  });

  let data: JsonObject;
  try {
    const yamlFile = fs.readFileSync('calendar-openapi.yaml', 'utf8');
    // data = yaml.load(yamlFile) as JsonObject;
    // if (!data) {
    //   throw new Error('Failed to load OpenAPI spec');
    // }
  } catch (e) {
    console.error(e);
    return;
  }

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ refresh_token: account?.refresh_token });

  const { credentials } = await oauth2Client.refreshAccessToken();

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
  });

  //   console.log('account: ', account);

  const calendarId = 'primary';
  const timeMin = new Date().toISOString();

  //   const { data } = await calendar.events.list({
  //     calendarId,
  //     timeMin,
  //     singleEvents: true,
  //     orderBy: 'startTime',
  //     maxResults: 2,
  //   });

  const model = new ChatOpenAI({ temperature: 0 });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${credentials.access_token}`,
  };
  // const toolkit = new OpenApiToolkit(new JsonSpec(data), model, {});
  // const executor2 = createOpenApiAgent(model, toolkit);

  // const test = await executor2.call({
  //   input: `Make a GET request to Goole Calendar API /calendars/primary/events. The prompt should be 'What is my next event on my calendar?'`,
  // });
  // console.log('output', test.output);

  // return { output: test.ouput };
  const input = `What's my schedule for tomorrow?`;

  const template = `You are given the below API Documentation:
  
  API documentation:
  Endpoint: https://api.themoviedb.org/3
  GET /events/list
  
  This API is for fetching events.  

  Request body (JSON object):
  maxResults | integer | optional
  timeMin | RFC3339 timestamp string | optional

  Using this documentation, generate the full API Request Body to call for answering the user question.
  You should build the API Request body in order to get a response that is as short as possible, while still getting the necessary information to answer the question. Pay attention to deliberately exclude any unnecessary pieces of data in the API call.  

  Question: ${input}
  Request body: 
  `;

  const prompt = new PromptTemplate({
    template: template,
    inputVariables: [],
  });

  const chain = new LLMChain({
    llm: new OpenAI({ temperature: 0 }),
    prompt,
  });

  const test = await chain.call({});
  console.log(test);

  return {
    output: test,
  };

  const tools = [
    new DynamicTool({
      name: 'Google Calendar',
      description: 'call this to get google calendar events',
      func: async () => {
        //         API_URL_PROMPT_TEMPLATE = """You are given the below API Documentation:
        // {api_docs}
        // Using this documentation, generate the full API url to call for answering the user question.
        // You should build the API url in order to get a response that is as short as possible, while still getting the necessary information to answer the question. Pay attention to deliberately exclude any unnecessary pieces of data in the API call.

        // Question:{question}
        // API url:"""

        // API_URL_PROMPT = PromptTemplate(
        //     input_variables=[
        //         "api_docs",
        //         "question",
        //     ],
        //     template=API_URL_PROMPT_TEMPLATE,
        // )

        const { data } = await calendar.events.list({
          calendarId,
          timeMin,
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 2,
        });

        return JSON.stringify(data);
      },
    }),
  ];

  const executor = await initializeAgentExecutor(
    tools,
    model,
    'chat-zero-shot-react-description'
  );
  console.log('Loaded agent.');

  //   console.log(`Executing with input "${input}"...`);

  const result = await executor.call({ input });

  console.log(`Got output ${result.output}`);

  //   console.log(
  //     `Got intermediate steps ${JSON.stringify(
  //       result.intermediateSteps,
  //       null,
  //       2
  //     )}`
  //   );

  return {
    output: result.output,
  };
};

handler.post(respond(getStatus));

export default handler;
