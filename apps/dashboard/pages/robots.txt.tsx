import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const host = 'https://dataup.ru';

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
