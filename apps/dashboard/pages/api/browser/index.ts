import chromium from '@sparticuz/chromium';
import { NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';

import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';

const handler = createApiHandler();

export const browser = async (req: AppNextApiRequest, res: NextApiResponse) => {
  const url = req.query.url as string;

  const customUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROMIUM_PATH || (await chromium.executablePath()),
    args: process.env.CHROMIUM_PATH ? undefined : chromium.args,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setUserAgent(customUserAgent);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 100000 });

  let content = await page.content();

  await browser.close();

  return {
    result: content,
  };
};

handler.get(respond(browser));

export default handler;
