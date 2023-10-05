// copilot
// https://app.chaindesk.ai => chaindesk.ai
export const getRootDomain = (url: string) => {
  const domain = url.split('/')[2];
  const parts = domain.split('.');
  return parts.slice(parts.length - 2).join('.');
};

export function getRootDomainFromHostname(hostname: string) {
  // Remove www. prefix if present
  const domain = hostname.replace(/^www\./, '');

  // Extract root domain using regex
  const rootDomainMatch = domain.match(/[^.]+\.[^.]+$/);
  if (rootDomainMatch) {
    return rootDomainMatch[0];
  }

  return domain;
}

export const getProtocol = (url: string) => {
  return new URL(url).protocol;
};

export default getRootDomain;
