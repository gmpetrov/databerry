import { NextApiRequest, NextApiResponse } from 'next';

import products from '@app/utils/data/products.json';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/xml');

  // Instructing the Vercel edge to cache the file
  res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600');

  const baseUrl = 'https://www.chaindesk.ai';

  const paths = [
    '/',
    '/pricing',
    ...products.map((product) => `/products/${product.slug}`),
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

  res.end(xml);
}
