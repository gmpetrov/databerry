import { ServiceProviderType } from '@prisma/client';
import axios from 'axios';
import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@app/types';
import { ApiError, ApiErrorType } from '@app/utils/api-error';
import { createApiHandler, respond } from '@app/utils/createa-api-handler';
import prisma from '@app/utils/prisma-client';

const handler = createApiHandler();

export const getProviders = async (
    req: AppNextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { organizationId } = req.query;
        if (!organizationId) {
            throw new ApiError(ApiErrorType.INVALID_REQUEST);
        }
        const providers = await prisma.serviceProvider.findMany({
            where: {
                organizationId: organizationId as string,
                AND: {
                    type: 'notion'
                }
            },
            select: {
                name: true,
                id: true
            }
        })

        return providers;
    } catch (e) {
        if (e instanceof ApiError) {
            throw new Error(e.message)
        }
        throw e
    }
};

handler.get(respond(getProviders));
export default handler;