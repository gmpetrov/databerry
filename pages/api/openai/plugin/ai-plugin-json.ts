import { DatastoreVisibility } from "@prisma/client";
import { NextApiResponse } from "next";

import { AppNextApiRequest } from "@app/types/index";
import { createApiHandler, respond } from "@app/utils/createa-api-handler";
import getSubdomain from "@app/utils/get-subdomain";
import prisma from "@app/utils/prisma-client";

const handler = createApiHandler();

export const generateAiPluginJson = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const host = req?.headers?.["host"];
  const subdomain = getSubdomain(host!);

  if (!subdomain) {
    return res.status(400).send("Missing subdomain");
  }

  const datastore = await prisma.datastore.findUnique({
    where: {
      id: subdomain,
    },
  });

  if (!datastore) {
    return res.status(404).send("Not found");
  }

  const config = {
    schema_version: "v1",
    name_for_model: datastore.name,
    name_for_human: datastore.name,
    description_for_model: datastore.description,
    description_for_human: datastore.description,
    ...(datastore.visibility === DatastoreVisibility.public
      ? {}
      : {
          auth: {
            type: "user_http",
            authorization_type: "bearer",
          },
        }),
    api: {
      type: "openapi",
      url: `https://${host}/.well-known/openapi.yaml`,
      has_user_authentication: false,
    },
    logo_url: `https://${host}/.well-known/logo.png`,
    contact_email: "hello@griot.kasetolabs.xyz",
    legal_info_url: "hello@griot.kasetolabs.xyz",
  };

  return res.json(config);
};

handler.get(generateAiPluginJson);

export default handler;
