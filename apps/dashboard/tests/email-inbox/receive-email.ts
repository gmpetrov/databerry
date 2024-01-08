import axios from 'axios';
import fs, { ReadStream } from 'fs';
import path from 'path';

import { s3 } from '@chaindesk/lib/aws';

import payload from './webhook-payload.json';

(async () => {
  // put file in s3 bucket
  // call api endpoint to process file

  const uploadParams = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME as string,
    Key: 'emails/s6q2haqhraouel4k8rlrmfpro4g91grivc3pbao1',
    Body: undefined as undefined | ReadStream,
  };
  const file = path.resolve(__dirname, 'messages/1.smtp');

  const fileStream = fs.createReadStream(file);
  fileStream.on('error', function (err) {
    console.log('File Error', err);
    throw err;
  });

  uploadParams.Body = fileStream;

  await s3.upload(uploadParams).promise();

  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/emails/webhook`,
    payload
  );

  console.log('res', res.data);
})();
