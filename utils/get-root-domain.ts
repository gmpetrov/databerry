// copilot
// https://app.databerry.ai => databerry.ai
export const getRootDomain = (url: string) => {
  const domain = url.split('/')[2];
  const parts = domain.split('.');
  return parts.slice(parts.length - 2).join('.');
};

export const getProtocol = (url: string) => {
  return new URL(url).protocol;
};

export const generateDatastoreUrl = (props: {
  appUrl: string;
  datastoreId: string;
}) => {
  const { appUrl, datastoreId } = props;
  const protocol = getProtocol(appUrl);
  const rootDomain = getRootDomain(appUrl);

  return `${protocol}//${datastoreId}.${rootDomain}`;
};

export default getRootDomain;
