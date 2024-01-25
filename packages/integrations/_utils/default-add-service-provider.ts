import { AppNextApiRequest } from '@chaindesk/lib/types';
import { ServiceProviderSchema } from '@chaindesk/lib/types/dtos';
import { ServiceProviderType } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';

const defaultCreateServiceProvider = async <
  T extends {} = ServiceProviderSchema
>({
  type,
  name,
  session,
  agentId,
  config,
  accessToken,
  externalId,
  validate,
}: {
  name?: string;
  type: ServiceProviderType;
  config: T;
  agentId?: string;
  session: AppNextApiRequest['session'];
  accessToken?: string;
  externalId?: string;
  validate?: (config: T) => Promise<boolean>;
}) => {
  let agent = null;
  if (agentId) {
    agent = await prisma.agent.findUnique({
      where: {
        id: agentId,
      },
    });

    if (agent?.organizationId !== session?.organization?.id) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  }

  if (validate) {
    try {
      const isValid = await validate(config);

      if (!isValid) {
        throw new ApiError(ApiErrorType.INTEGRATION_VALIDATION_FAILED);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        console.log(JSON.stringify(err, null, 2));

        throw new ApiError(ApiErrorType.INTEGRATION_CREDENTIALS_INVALID);
      }
    }
  }

  const integration = await prisma.serviceProvider.create({
    data: {
      type,
      config: {
        ...config,
      },
      name,
      ...(agentId
        ? {
            agents: {
              connect: {
                id: agentId,
              },
            },
          }
        : {}),
      organization: {
        connect: {
          id: session?.organization?.id,
        },
      },
      owner: {
        connect: {
          id: session?.user?.id,
        },
      },
      externalId,
      accessToken,
    },
  });

  return integration;
};

export default defaultCreateServiceProvider;
