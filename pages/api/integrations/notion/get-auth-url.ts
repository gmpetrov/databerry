import { Client } from '@notionhq/client';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';
const handler = createApiHandler();

export const getAuthUrl = async (
    req: AppNextApiRequest,
    res: NextApiResponse
) => {
    const authUrl = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${process.env.NOTION_CLIENT_ID}&response_type=code`

    return authUrl
};

handler.get(respond(getAuthUrl));
export default handler;