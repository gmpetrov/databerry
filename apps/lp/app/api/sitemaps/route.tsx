export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL as string;

  const paths = [`${baseUrl}/api/sitemaps/main.xml`] as string[];

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
