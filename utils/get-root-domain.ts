// copilot
// https://app.databerry.ai => databerry.ai
const getRootDomain = (url: string) => {
  const domain = url.split('/')[2];
  const parts = domain.split('.');
  return parts.slice(parts.length - 2).join('.');
};

export default getRootDomain;
