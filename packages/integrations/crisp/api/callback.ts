import { NextApiResponse } from 'next/types';
import { AppNextApiRequest } from '@chaindesk/lib/types';
export default function callback(req: AppNextApiRequest, res: NextApiResponse) {
  return 'callback';
}
