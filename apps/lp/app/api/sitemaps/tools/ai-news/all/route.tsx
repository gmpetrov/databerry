import { youtubeSummaryTool } from '@chaindesk/lib/config';
import { Prisma } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';

export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL as string;

  const total = await prisma.lLMTaskOutput.count({
    where: {
      type: 'web_page_summary',
      output: {
        path: ['metadata', 'title'],
        not: Prisma.AnyNull,
      },
    },
  });

  const nbPages = Math.ceil(total / youtubeSummaryTool.paginationLimit);

  const paths = new Array(nbPages)
    .fill(42)
    .map((_, index) => `${baseUrl}/ai-news/all/${index}`);

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
