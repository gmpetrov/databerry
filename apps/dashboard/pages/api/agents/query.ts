import { NextApiResponse } from 'next';
import { z } from 'zod';

import ChatModel from '@chaindesk/lib/chat-model';
import { ModelConfig } from '@chaindesk/lib/config';
import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import streamData from '@chaindesk/lib/stream-data';
import { AppNextApiRequest, SSE_EVENT } from '@chaindesk/lib/types';

const handler = createAuthApiHandler();

export const query = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const { action, content } = JSON.parse(req.body);
  const ctrl = new AbortController();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  req.socket.on('close', function () {
    ctrl.abort();
  });

  const model = new ChatModel();

  const handleStream = (text: string, event: SSE_EVENT | undefined): any =>
    streamData({
      event: event || SSE_EVENT.answer,
      data: text,
      res,
    });

  const { answer } = await model.call({
    model: ModelConfig.gpt_3_5_turbo.name,
    messages: [
      { role: 'system', content: action },
      { content, role: 'user' },
    ],
    stream: true,
    handleStream,
  });

  streamData({
    data: '[DONE]',
    res,
  });
  return { answer };
};

handler.post(respond(query));

export default handler;
