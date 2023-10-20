// copilot
// https://app.chaindesk.ai => chaindesk.ai
export const getRootDomain = (url: string) => {
  // const domain = url.split('/')[2];
  // const parts = domain.split('.');
  // return parts.slice(parts.length - 2).join('.');
  let domain;
  // Remove any protocol (http, https, ftp, etc.)
  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }

  // Remove port number if it exists
  domain = domain.split(':')[0];

  // Split the domain into its parts (subdomains, domain, and TLD)
  let domainParts = domain.split('.');

  // If there are more than 2 parts, slice the array to get the last two parts
  if (domainParts.length > 2) {
    domainParts = domainParts.slice(-2);
  }

  // Join the domain parts back together
  let rootDomain = domainParts.join('.');

  return rootDomain;
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
