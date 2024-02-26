import { NextApiRequest } from 'next';

const locationHeaders = [
  'cf-ipcity',
  'cf-region',
  'cf-region-code',
  'cf-postal-code',
  'cf-timezone',
  'cf-ipcontinent',
  'x-vercel-ip-country', // Vercel
  'cf-ipcountry', // Cloudflare
] as const;

const headerToKey = {
  'cf-ipcity': 'city',
  'cf-region': 'region',
  'cf-region-code': 'region-code',
  'cf-postal-code': 'postal-code',
  'cf-timezone': 'timezone',
  'cf-ipcontinent': 'continent',
  'cf-ipcountry': 'country',
  'x-vercel-ip-country': 'country',
} as const;

type locationKeys = (typeof headerToKey)[keyof typeof headerToKey];

const getRequestLocation = (req: NextApiRequest) => {
  const location = {} as Record<locationKeys, any>;

  for (const header of locationHeaders) {
    location[headerToKey[header]] ||= req.headers[header];
  }

  return location;
};

export default getRequestLocation;
