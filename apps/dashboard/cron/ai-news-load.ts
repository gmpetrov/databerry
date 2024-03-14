import pMap from 'p-map';
import pRetry from 'p-retry';

import aiNewsFeeds from '@chaindesk/lib/data/ai-news-rss';
import ytFeeds from '@chaindesk/lib/data/youtube-channels-rss';
import { Parser } from '@chaindesk/lib/rss';

const isISODateLessThat2DaysOld = (isoDate: string) => {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInDays = diff / (1000 * 3600 * 24);
  return diffInDays < 2;
};

const load = async ({
  endpoint,
  feeds,
}: {
  endpoint: string;
  feeds: string[];
}) => {
  const parser = new Parser();

  const handleFeed = async (feedUrl: string) => {
    const feed = await parser.parseURL(feedUrl);

    const filtered = feed.items;
    // const filtered = feed.items.filter(
    //   (item) => item.isoDate && isISODateLessThat2DaysOld(item.isoDate)
    // );

    const items = filtered.map((item) => ({
      url: item.link,
      date: item.isoDate,
    }));

    console.log(
      `Processing RSS Feed ${feedUrl}: ${items.length} items to process`
    );

    await pMap(
      items,
      async ({ url, date }) => {
        await pRetry(
          async () => {
            await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Api-Key': process.env.NEXTAUTH_SECRET || '',
              },
              body: JSON.stringify({
                url,
                date,
              }),
            });
          },
          {
            retries: 1,
          }
        ).catch((err) => console.log(url, err));
      },
      {
        concurrency: 1,
      }
    );

    console.log(`✅ Finished ${feedUrl}`);
  };

  await pMap(
    feeds,
    async (url) =>
      pRetry(
        async () => {
          return handleFeed(url);
        },
        { retries: 1 }
      ).catch((err) => console.log(url, err)),
    { concurrency: 1 }
  );

  console.log(`✅ Finished`);
};

(async () => {
  await load({
    endpoint: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/tools/web-page-summary`,
    feeds: aiNewsFeeds,
  });
  await load({
    endpoint: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/tools/youtube-summary`,
    feeds: ytFeeds,
  });
})();
