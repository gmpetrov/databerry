import { ServiceProviderType } from '@prisma/client';
import axios from 'axios';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

interface notionSuccessResponse {
  access_token: string,
  bot_id: string,
  duplicated_template_id: string | null,
  owner: {
    workspace: boolean
  },
  workspace_icon: string,
  workspace_id: string,
  workspace_name: string
}

const NOTION_VERSION = '2022-06-28'

const handler = createApiHandler();

export const callback = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { code, organizationId } = req.body;
    if (!code || !organizationId) {
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
        'Notion-Version': NOTION_VERSION,
      },
    };
    const { data } = await axios.post(url, body, headers);

    if (!data.access_token) {
      throw new Error('Access token is not specified !')
    }
    const ExistingAccount = await prisma.serviceProvider.findFirst({
      where: {
        accessToken: data.access_token
      }
    })

    if (ExistingAccount) {
      return res.redirect('/close-window')
    }
    // save token to db
    await prisma.serviceProvider.create({
      data: {
        name: data.workspace_name,
        type: ServiceProviderType.notion,
        accessToken: data.access_token,
        organization: {
          connect: {
            id: organizationId
          },
        },
      },
    })
    return res.redirect('/close-window')
  } catch (e) {
    if (e instanceof ApiError) {
      throw new Error(e.message)
    }
    throw e
  }
};

handler.post(callback);
export default handler;