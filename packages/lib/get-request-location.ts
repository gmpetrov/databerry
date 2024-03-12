import { NextApiRequest } from 'next';

const mock = {
  'cf-ipcity': 'Paris',
  'cf-ipcountry': 'FR',
  'x-vercel-ip-country': 'FR',
  'cf-region': 'Ãle-de-France',
  'cf-region-code': 'IDF',
  'cf-postal-code': '75019',
  'cf-timezone': 'Europe/Paris',
  'cf-ipcontinent': 'EU',
} as const;

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
    location[headerToKey[header]] ||=
      process.env.NODE_ENV === 'development'
        ? mock[header]
        : req.headers[header];
  }

  return location;
};

export default getRequestLocation;
