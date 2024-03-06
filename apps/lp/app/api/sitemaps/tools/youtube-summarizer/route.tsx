import { NextApiRequest, NextApiResponse } from 'next';

import { youtubeSummaryTool } from '@chaindesk/lib/config';
import { Prisma } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

export async function GET(req: Request) {
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/xml');

  // Instructing the Vercel edge to cache the file
  // res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600');

  const baseUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL as string;

  const count = await prisma.lLMTaskOutput.count({
    where: {
      type: 'youtube_summary',
      output: {
        path: ['metadata', 'title'],
        not: Prisma.AnyNull,
      },
    },
  });

  const nbPages = Math.ceil(count / youtubeSummaryTool.sitemapPageSize);

  const paths = [
    `${baseUrl}/api/sitemaps/tools/youtube-summarizer/all.xml`,
    ...new Array(nbPages)
      .fill(0)
      .map(
        (_, index) =>
          `${baseUrl}/api/sitemaps/tools/youtube-summarizer/${index}.xml`
      ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 

      ${paths
        .map(
          (url) => `<sitemap>
      <loc>${url}</loc>
    </sitemap>`
        )
        .join('\n')}
      </sitemapindex>`;

  return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
}
