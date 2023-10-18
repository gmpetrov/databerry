import Cors from 'cors';
import { NextApiResponse } from 'next';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';

const handler = createApiHandler();

export async function getCrisp(req: AppNextApiRequest, res: NextApiResponse) {
  const crisp_website_id = process.env.CRISP_WEBSITE_ID;
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
    </head>
    <body>
      <h1>Test Crisp</h1>
  
      <script type="text/javascript">
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = '${crisp_website_id}';
        (function () {
          d = document;
          s = d.createElement('script');
          s.src = 'https://client.crisp.chat/l.js';
          s.async = 1;
          d.getElementsByTagName('head')[0].appendChild(s);
        })();
      </script>
    </body>
  </html>
  `);
}
handler.get(respond(getCrisp));

export default handler;
