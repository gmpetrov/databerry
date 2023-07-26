import axios from "axios"
import { NextApiResponse } from "next";
import { useRouter } from "next/router"

import { AppNextApiRequest } from "@app/types";
import { createApiHandler } from "@app/utils/createa-api-handler";
import { NotionAuthManager } from "@app/utils/notion-manager";

const handler = createApiHandler();

export const getToken = async (req: AppNextApiRequest, res: NextApiResponse) => {
    const url = "https://api.notion.com/v1/oauth/token/"
    const key = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64");
    const data = {
        "grant_type": "authorization_code",
        "code": req.body.code
    }
    const headers = {
        headers:{
          'Authorization': `Basic ${key}`,
          'Notion-Version': process.env.NOTION_VERSION
        }
    }
    const response = await axios.post(url,data,headers)
   res.send(response.data)
  };
handler.post(getToken);
export default handler;
