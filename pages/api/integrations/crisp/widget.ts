import Crisp from 'crisp-api';
import { OpenAI } from 'langchain/llms/openai';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types/index';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import validate from '@app/utils/validate';

const handler = createApiHandler();

const schema = z.object({
  website_id: z.string().min(1),
  session_id: z.string().min(1),
  token: z.string().min(1),
  locale: z.string().optional(),
});

const CrispClient = new Crisp();

CrispClient.authenticateTier(
  'plugin',
  process.env.CRISP_TOKEN_ID!,
  process.env.CRISP_TOKEN_KEY!
);

export const widgetActions = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as z.infer<typeof schema>;

  //   const websites = await getConnectedWebsites();

  //   if (data.token !== websites[data.website_id]?.token) {
  //     throw new Error('Invalid website token');
  //   }

  const messages = await CrispClient.website.getMessagesInConversation(
    data.website_id,
    data.session_id
  );

  const messagesStr = messages
    .map((msg: any) =>
      msg?.content && typeof msg?.content === 'string'
        ? `FROM: ${msg?.from} ${msg?.user?.nickname || ''} \nMESSAGE: ${
            msg.content
          }\n`
        : ``
    )
    .filter((msg: any) => msg !== ``)
    .join('\n\n');

  const model = new OpenAI({
    temperature: 0,
    modelName: 'gpt-3.5-turbo-0613',
  });

  const prompt = `The following is conversation between a customer and a customer suport operator. Generate a summary of the conversation that would be useful to the operator.
  ${messagesStr}

  SUMMARY: 
  `;

  const output = await model.call(prompt);

  await CrispClient.website.sendMessageInConversation(
    data.website_id,
    data.session_id,
    {
      type: 'text',
      from: 'operator',
      origin: 'chat',
      user: {
        nickname: 'Chaindesk.ai',
        avatar: 'https://chaindesk.ai/app-rounded-bg-white.png',
      },
      stealth: true,
      content: `Summary:\n${output}`,
    }
  );

  return {
    success: true,
  };
};

handler.post(
  validate({
    body: schema,
    handler: respond(widgetActions),
  })
);

export default handler;

// {
//     session_id: 'session_f55e6731-51a4-4815-a1e3-655db78bb358',
//     website_id: '5678ba03-6008-4fe3-aeef-aa78466c0bbc',
//     fingerprint: 168185200342546,
//     type: 'text',
//     from: 'user',
//     origin: 'chat',
//     content: 'yooo',
//     user: {
//       user_id: 'session_f55e6731-51a4-4815-a1e3-655db78bb358',
//       nickname: 'visitor56680'
//     },
//     delivered: '',
//     read: 'chat',
//     preview: [],
//     mentions: [],
//     stamped: true,
//     timestamp: 1681852003479
//   },
//   {
//     session_id: 'session_f55e6731-51a4-4815-a1e3-655db78bb358',
//     website_id: '5678ba03-6008-4fe3-aeef-aa78466c0bbc',
//     fingerprint: 168185202069092,
//     type: 'text',
//     from: 'operator',
//     origin: 'chat',
//     content: 'Hey there! Need help?',
//     delivered: '',
//     read: '',
//     preview: [],
//     mentions: [],
//     stamped: true,
//     timestamp: 1681852020690
//   }
