import { S3 } from "@aws-sdk/client-s3";

export const s3 = new S3({
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.APP_AWS_SECRET_KEY
  },

  // The key signatureVersion is no longer supported in v3, and can be removed.
  // @deprecated SDK v3 only supports signature v4.
  signatureVersion: 'v4',

  region: process.env.APP_AWS_REGION,

  ...(process.env.APP_AWS_S3_ENDPOINT
    ? {
        endpoint: process.env.APP_AWS_S3_ENDPOINT,
        s3ForcePathStyle: process.env.APP_AWS_S3_FORCE_PATH_STYLE === 'true',
      }
    : {})
});

export async function deleteFolderFromS3Bucket(
  bucketName: string,
  prefix: string
) {
  const listParams = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  const listedObjects = await s3.listObjectsV2(listParams);

  if (listedObjects?.Contents?.length === 0) return;

  const deleteParams = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Delete: { Objects: [] as any },
  };

  listedObjects?.Contents?.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  return s3.deleteObjects(deleteParams);
}
