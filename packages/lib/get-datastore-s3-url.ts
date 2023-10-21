import getS3RootDomain from './get-s3-root-domain';

const getDatastoreS3Url = (datastoreId: string) => {
  return `${getS3RootDomain()}/datastores/${datastoreId}`;
};

export default getDatastoreS3Url;
