import Cors from 'cors';
import fs from 'fs';
import { NextApiResponse } from 'next';
import path from 'path';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { AppNextApiRequest } from '@chaindesk/lib/types';

const handler = createAuthApiHandler();

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export const getModule = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  try {
    const filePath =
      '/Users/benzha/Desktop/databerry/apps/dashboard/dist/index.js';

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    res.setHeader('Content-Type', 'application/javascript');

    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error reading and sending HTML file:', error);
    res.status(500).send('Internal Server Error');
  }
};

handler.get(cors, respond(getModule));

export default handler;
