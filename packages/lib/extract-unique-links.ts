import getRootDomain from './get-root-domain';

const extractUniqueRootLinks = (text: string) => {
  const urlRegex = /\b(?:https?:\/\/|www\.)\S+\b/g;
  const foundLinks = text.match(urlRegex) || [];
  const uniqueDomains = new Set();
  const uniqueLinks: string[] = [];

  foundLinks.forEach((link) => {
    const rootDomain = getRootDomain(link);
    if (!uniqueDomains.has(rootDomain)) {
      uniqueDomains.add(rootDomain);
      uniqueLinks.push(link);
    }
  });

  return uniqueLinks;
};

export default extractUniqueRootLinks;
