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
    res.status(200).json( process.env.NOTION_CLIENT_ID );
  };
handler.get(auth);

export default handler;
