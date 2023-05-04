import { NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { Middleware } from "next-connect";

import { authOptions } from "@app/pages/api/auth/[...nextauth]";
import { AppNextApiRequest } from "@app/types/index";

const auth: Middleware<AppNextApiRequest, NextApiResponse> = async (
  req,
  res,
  next
) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(403).end("Forbidden");
  }

  req.session = session;

  return next();
};

export default auth;
