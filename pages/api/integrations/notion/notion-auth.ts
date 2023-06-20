import axios from "axios"
import { NextApiResponse } from "next";
import { useRouter } from "next/router"

import { AppNextApiRequest } from "@app/types";
import { createApiHandler } from "@app/utils/createa-api-handler";
import { NotionAuthManager } from "@app/utils/notion-manager";

const handler = createApiHandler();

export const auth = (req: AppNextApiRequest, res: NextApiResponse) => {
    // const notionManager = new NotionAuthManager();
  
    // const authUrl = notionManager.auth
    // console.log(authUrl)
    const data = {
      client_id: process.env.NOTION_CLIENT_ID,
      client_secret: process.env.NOTION_CLIENT_SECRET,
      notion_version: process.env.NOTION_VERSION
    }
    res.status(200).json( data );
  };
handler.get(auth);

export default handler;
