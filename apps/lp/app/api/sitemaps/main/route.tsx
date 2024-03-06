import competitors from '@chaindesk/lib/data/competitors';
import integrations from '@chaindesk/lib/data/integrations';
import products from '@chaindesk/lib/data/products';
import slugify from '@chaindesk/lib/slugify';

export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL as string;

  const paths = [
    '/',
    '/pricing',
    `/tools/youtube-summarizer`,
    ...products.map((product) => `/products/${product.slug}`),
    ...integrations.map((product) => `/integrations/${product.slug}`),
    ...competitors.map((name) => `/compare/${slugify(name)}-alternative`),
  ].map((each) => `${baseUrl}${each}`);

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
