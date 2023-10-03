const getDatastoreS3Url = (datastoreId: string) => {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/datastores/${datastoreId}`;
};

export default getDatastoreS3Url;
