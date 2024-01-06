import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  let host = req.headers.host || 'https://www.chaindesk.ai';
  if (!host?.startsWith('http')) {
    host = `https://${host}`;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({ error: 'method not allowed' }));
    res.end();

    return {
      props: {},
    };
  }

  // cache for up to one day
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.setHeader('Content-Type', 'text/plain');

  // only allow the site to be crawlable on the production deployment
  if (process.env.VERCEL_ENV === 'production') {
    res.write(`User-agent: *
Allow: /

Sitemap: ${host}/sitemap.xml
Sitemap: ${host}/help/sitemap.xml
${
  host?.includes('chaindesk.ai')
    ? `Sitemap: ${host}/api/tools/youtube-summary/sitemap`
    : ''
}

`);
  } else {
    res.write(`User-agent: *
Disallow: /

Sitemap: ${host}/sitemap.xml
Sitemap: ${host}/help/sitemap.xml
`);
  }

  res.end();

  return {
    props: {},
  };
};

export default () => null;
