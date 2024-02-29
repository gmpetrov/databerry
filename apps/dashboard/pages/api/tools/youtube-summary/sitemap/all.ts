import { NextApiRequest, NextApiResponse } from 'next';

import { youtubeSummaryTool } from '@chaindesk/lib/config';
import slugify from '@chaindesk/lib/slugify';
import { Prisma } from '@chaindesk/prisma';
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

  const total = await prisma.lLMTaskOutput.count({
    where: {
      type: 'youtube_summary',
      output: {
        path: ['metadata', 'title'],
        not: Prisma.AnyNull,
      },
    },
  });

  const nbPages = Math.ceil(total / youtubeSummaryTool.paginationLimit);

  const paths = new Array(nbPages)
    .fill(42)
    .map((_, index) => `${baseUrl}/tools/youtube-summarizer/all/${index}`);

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
