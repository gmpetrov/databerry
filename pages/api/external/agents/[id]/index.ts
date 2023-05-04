import { Agent } from "@prisma/client";
import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

import { AppNextApiRequest } from "@app/types/index";
import { ApiError, ApiErrorType } from "@app/utils/api-error";
import { createApiHandler, respond } from "@app/utils/createa-api-handler";
import guardExternalAgent from "@app/utils/guard-external-agent";
import prisma from "@app/utils/prisma-client";
import runMiddleware from "@app/utils/run-middleware";

const handler = createApiHandler();

const cors = Cors({
  methods: ["GET", "HEAD"],
});

export const getAgent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const agentId = req.query.id as string;

  // get Bearer apiKey from header
  const authHeader = req.headers.authorization;
  const apiKey = authHeader && authHeader.split(" ")?.[1];

  if (!agentId) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  const agent = await prisma.agent.findUnique({
    where: {
      id: agentId,
    },
    include: {
      owner: {
        include: {
          usage: true,
          apiKeys: true,
          subscriptions: {
            where: {
              status: "active",
            },
          },
        },
      },
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  if (!agent) {
    throw new ApiError(ApiErrorType.INVALID_REQUEST);
  }

  // let origin = '';

  // try {
  //   origin = new URL(req.headers['origin'] as string).host;
  // } catch (err) {
  //   console.log('err', req.headers['origin'], err);
  // }
  // guardExternalAgent({
  //   agent: agent as any,
  //   apiKey: apiKey,
  //   hostname: origin,
  // });

  return {
    ...agent,
    owner: undefined,
  } as Agent;
};

handler.get(respond(getAgent));

export default async function wrapper(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  return handler(req, res);
}
