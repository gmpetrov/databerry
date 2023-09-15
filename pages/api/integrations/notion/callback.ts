import axios from 'axios';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const callback = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      throw new ApiError(ApiErrorType.INVALID_REQUEST);
    }
    const url = 'https://api.notion.com/v1/oauth/token/';
    const key = Buffer.from(
      `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
    ).toString('base64');
    const body = {
      grant_type: 'authorization_code',
      code: code,
    };
    const headers = {
      headers: {
        Authorization: `Basic ${key}`,
        'Notion-Version': process.env.NOTION_VERSION,
      },
    };
    const { data } = await axios.post(url, body, headers);
    await prisma.token.create({
      data: {
        value: data.access_token,
        integration: 'notion',
        userId,
      },
    });

    return res.status(200).send(data);
  } catch (e) {
    return res.status(500).send('Internal Server Error');
  }
};
handler.post(callback);
export default handler;
