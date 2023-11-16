import Crisp from 'crisp-api';
// import { OpenAI } from 'langchain/llms/openai';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AIStatus, ConversationMetadata } from '@chaindesk/lib/types/crisp';
import {
  CrispSchema,
  CrispUpdateMetadataSchema,
} from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';

const handler = createApiHandler();

const CrispClient = new Crisp();

CrispClient.authenticateTier(
  'plugin',
  process.env.CRISP_TOKEN_ID!,
  process.env.CRISP_TOKEN_KEY!
);

// export const widgetActions = async (
//   req: AppNextApiRequest,
//   res: NextApiResponse
// ) => {
//   const data = req.body as z.infer<typeof CrispSchema>;

//   //   const websites = await getConnectedWebsites();

//   //   if (data.token !== websites[data.website_id]?.token) {
//   //     throw new Error('Invalid website token');
//   //   }

//   const messages = await CrispClient.website.getMessagesInConversation(
//     data.website_id,
//     data.session_id
//   );

//   const messagesStr = messages
//     .map((msg: any) =>
//       msg?.content && typeof msg?.content === 'string'
//         ? `FROM: ${msg?.from} ${msg?.user?.nickname || ''} \nMESSAGE: ${
//             msg.content
//           }\n`
//         : ``
//     )
//     .filter((msg: any) => msg !== ``)
//     .join('\n\n');

//   const model = new OpenAI({
//     temperature: 0,
//     modelName: 'gpt-3.5-turbo',
//   });

//   const prompt = `The following is conversation between a customer and a customer suport operator. Generate a summary of the conversation that would be useful to the operator.
//   ${messagesStr}

//   SUMMARY:
//   `;

//   const output = await model.call(prompt);

//   await CrispClient.website.sendMessageInConversation(
//     data.website_id,
//     data.session_id,
//     {
//       type: 'text',
//       from: 'operator',
//       origin: 'chat',
//       user: {
//         nickname: 'Chaindesk',
//         avatar: 'https://chaindesk.ai/app-rounded-bg-white.png',
//       },
//       stealth: true,
//       content: `Summary:\n${output}`,
//     }
//   );

//   return {
//     success: true,
//   };
// };

// handler.post(
//   validate({
//     body: CrispSchema,
//     handler: respond(widgetActions),
//   })
// );

export const getConversationMetadata = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.query as z.infer<typeof CrispSchema>;

  const metadata = (
    await CrispClient.website.getConversationMetas(
      data.website_id,
      data.session_id
    )
  )?.data as ConversationMetadata;

  return metadata;
};
handler.get(respond(getConversationMetadata));

export const patchConversationMetadata = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as z.infer<typeof CrispUpdateMetadataSchema>;

  const { website_id, session_id, token, locale, ...updateProps } = data;

  return CrispClient.website.updateConversationMetas(
    data.website_id,
    data.session_id,
    {
      data: {
        ...updateProps,
        ...(updateProps.aiStatus === AIStatus.disabled
          ? {
              aiDisabledDate: new Date(),
            }
          : {}),
      } as ConversationMetadata,
    }
  );
};
handler.patch(
  validate({
    body: CrispUpdateMetadataSchema,
    handler: respond(patchConversationMetadata),
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
