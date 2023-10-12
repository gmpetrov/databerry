import { AppNextApiRequest } from '@chaindesk/lib/types';
import { ServiceProviderSchema } from '@chaindesk/lib/types/dtos';
import { ServiceProviderType } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';
import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';

const defaultCreateServiceProvider = async <
  T extends {} = ServiceProviderSchema
>({
  name,
  session,
  agentId,
  config,
  validate,
}: {
  name?: string;
  config: T;
  agentId?: string;
  session: AppNextApiRequest['session'];
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
        throw new ApiError(ApiErrorType.INTEGRATION_CREDENTIALS_INVALID);
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      throw new ApiError(ApiErrorType.INTEGRATION_CREDENTIALS_INVALID);
    }
  }

  const integration = await prisma.serviceProvider.create({
    data: {
      type: ServiceProviderType.zendesk,
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
    },
  });

  return integration;
};

export default defaultCreateServiceProvider;
