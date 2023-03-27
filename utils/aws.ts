import { S3 } from 'aws-sdk';

export const s3 = new S3({
  signatureVersion: 'v4',
  accessKeyId: process.env.APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.APP_AWS_SECRET_KEY,
});

export async function listAllObjectsFromS3Bucket(
  bucket: string,
  prefix: string
) {
  let isTruncated = true;
  let marker;
  const elements = [] as any;
  while (isTruncated) {
    const params = { Bucket: bucket };
    if (prefix) (params as any).Prefix = prefix;
    if (marker) (params as any).Marker = marker;
    const response = (await s3.listObjects(params).promise()) as any;
    response?.Contents.forEach((item: any) => {
      if (item.Size > 0) {
        elements.push({
          url: `https://${bucket}.s3.amazonaws.com/${item.Key}`,
          size: item.Size,
        });
      }
    });

    isTruncated = response.IsTruncated;
    if (isTruncated) {
      marker = response.Contents.slice(-1)[0].Key;
    }
  }
  return elements;
}
