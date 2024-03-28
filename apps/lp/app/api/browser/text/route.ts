import chromium from '@sparticuz/chromium-min';
import { NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';

import { getTextFromHTML } from '@chaindesk/lib/loaders/web-page';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') as string;

  const customUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v123.0.0/chromium-v123.0.0-pack.tar'
      )),
    args: process.env.CHROMIUM_PATH ? undefined : chromium.args,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setUserAgent(customUserAgent);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 100000 });

  let content = await page.content();
  let text = (await getTextFromHTML(content))?.trim();

  if (!text) {
    console.log("not text parssed from html, let's try again after 10 seconds");
    await page.waitForTimeout(10000);
    text = (await getTextFromHTML(content))?.trim();
  }

  await browser.close();

  return NextResponse.json({
    result: text,
  });
}
