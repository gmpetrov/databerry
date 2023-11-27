import { NextApiRequest } from 'next';

const countryHeaders = [
  'x-vercel-ip-country', // Vercel
  'cf-ipcountry', // Cloudflare
];

const getRequestCountry = (req: NextApiRequest) => {
  for (const each of countryHeaders) {
    if (req.headers[each]) {
      return req.headers[each] as string;
    }
  }

  return undefined;
};

export default getRequestCountry;
