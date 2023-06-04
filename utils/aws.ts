import { S3 } from 'aws-sdk';

export const s3 = new S3({
  signatureVersion: 'v4',
  accessKeyId: process.env.APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.APP_AWS_SECRET_KEY,
  ...(process.env.NEXT_PUBLIC_AWS_ENDPOINT
    ? {
        endpoint: process.env.NEXT_PUBLIC_AWS_ENDPOINT,
        s3ForcePathStyle: true,
      }
    : {}),
});

export async function deleteFolderFromS3Bucket(
  bucketName: string,
  prefix: string
) {
  const listParams = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects?.Contents?.length === 0) return;

  const deleteParams = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Delete: { Objects: [] as any },
  };

  listedObjects?.Contents?.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();
}
