// https://app.chaindesk.ai => chaindesk.ai || https://quickstart-d70620f6.myshopify.com/ -> quickstart-d70620f6.myshopify
export function getRootDomain(url: string) {
  let hostname;

  // Extract the hostname from the URL
  if (url.indexOf('//') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  // Remove port number and query string if present
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];

  // Split the hostname into parts
  let parts = hostname.split('.');

  // Check if the first part (subdomain) contains a dash
  if (parts.length > 2 && parts[0].includes('-')) {
    return hostname;
  }

  // If no dash in the subdomain, remove subdomains
  while (parts.length > 2) {
    parts.shift();
  }

  // Join the remaining parts to get the root domain
  return parts.join('.');
}

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
