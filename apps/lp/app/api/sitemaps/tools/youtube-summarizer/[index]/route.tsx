import { NextApiRequest, NextApiResponse } from 'next';

import { youtubeSummaryTool } from '@chaindesk/lib/config';
import slugify from '@chaindesk/lib/slugify';
import { Prisma } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { index: string } }
) {
  const baseUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL as string;

  const offset = Number(params.index as string);

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

  return new Response(xml, { headers: { 'Content-Type': 'text/xml' } });
}
