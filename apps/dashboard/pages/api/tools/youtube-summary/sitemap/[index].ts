import { NextApiRequest, NextApiResponse } from 'next';

import { youtubeSummaryTool } from '@chaindesk/lib/config';
import slugify from '@chaindesk/lib/slugify';
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
  const offset = Number(req.query.index as string);

  const outputs = (await prisma.$queryRaw`
    SELECT external_id, output->'metadata'->'title' as title FROM llm_task_outputs
    WHERE type='youtube_summary' AND output->'metadata'->'title' IS NOT NULL
    ORDER BY created_at ASC
    LIMIT ${youtubeSummaryTool.sitemapPageSize}
    OFFSET ${offset * youtubeSummaryTool.sitemapPageSize} 
  `) as { external_id: string; title: string }[];

  const paths = outputs.map(
    (each) =>
      `${baseUrl}/tools/youtube-summarizer/${slugify(each.title)}-${
        each.external_id
      }`
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
