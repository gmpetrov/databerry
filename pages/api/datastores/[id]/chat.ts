// DEPRECATED: This is not used anymore

import { NextApiResponse } from "next";

import { AppNextApiRequest, ChatRequest } from "@app/types";
import chat from "@app/utils/chat";
import { createAuthApiHandler, respond } from "@app/utils/createa-api-handler";
import prisma from "@app/utils/prisma-client";

const handler = createAuthApiHandler();

export const chatRequest = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const session = req.session;
  const id = req.query.id as string;
  const data = req.body as ChatRequest;

  const datastore = await prisma.datastore.findUnique({
    where: {
      id,
    },
  });

  if (datastore?.ownerId !== session?.user?.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const result = await chat({
    datastore,
    query: data.query,
  });

  return result;
};

handler.post(respond(chatRequest));

export default handler;
