import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@chaindesk/prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/xml');

  // Instructing the Vercel edge to cache the file
  res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600');

  const baseUrl = 'https://www.chaindesk.ai';

  const outputs = await prisma.lLMTaskOutput.findMany({
    where: {
      type: 'youtube_summary',
    },
    select: {
      externalId: true,
    },
  });

  const paths = outputs.map(
    (each) => `${baseUrl}/tools/youtube-summarizer/${each.externalId}`
  );

  // generate sitemap here
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 

      ${paths
        .map(
          (url) => `<url>
      <loc>${url}</loc>
    </url>`
        )
        .join('\n')}
      </urlset>`;

  res.end(xml);
}
