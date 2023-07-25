import playwright from 'playwright';

export const fetchWithBrowser = async (url: string) => {
  const customUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';

  const browser = await playwright.chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    userAgent: customUserAgent,
  });

  const page = await context.newPage();
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 100000,
  });

  let content = await page.content();

  await context.close();
  await browser.close();

  return content;
};
