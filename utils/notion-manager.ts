import axios from "axios"
import { useRouter } from "next/router"


const getAuth = () => {
  const params = {
        client_id: process.env.NOTION_CLIENT_ID,
        response_type: "code",
        owner: "user"
    }
    return params
}
// const GetRouteCode = () => {
//     return useRouter().query
// }

export class NotionAuthManager {
   auth: any;
   constructor () {
    this.auth = getAuth();
   }
}
