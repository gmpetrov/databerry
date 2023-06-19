import { AppDatasource } from '@prisma/client';

import { s3 } from '@app/utils/aws';

const prepareSourceForWorker = (props: {
  datastoreId: string;
  datasourceId: string;
  text: string;
}) => {
  return s3
    .putObject({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: `datastores/${props.datastoreId}/${props.datasourceId}/${props.datasourceId}.txt`,
      Body: props.text,
      CacheControl: 'no-cache',
      ContentType: 'text/plain',
      ACL: 'public-read',
    })
    .promise();
};

export default prepareSourceForWorker;
