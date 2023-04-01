import axios from 'axios';
import { load } from 'cheerio';
import path from 'path';

// const sitemapUrl = 'https://mabanque.bnpparibas/sitemap.xml';
// (async () => {
//   axios
//     .get(sitemapUrl)
//     .then((response) => {
//       const parser = new DOMParser();
//       const xmlDom = parser.parseFromString(response.data, 'text/xml');
//       const locElements = xmlDom.getElementsByTagName('loc');
//       for (let i = 0; i < locElements.length; i++) {
//         console.log(locElements[i].textContent);
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// })();

const findDomainPages = async (startingUrl: string, nbPageLimit = 25) => {
  // Create a set to track visited URLs
  const visitedUrls = new Set<string>();

  // Define the crawl function
  async function crawl(url: string) {
    // Skip URLs that have already been visited
    if (visitedUrls.has(url)) {
      return;
    }

    // Add the URL to the set of visited URLs
    visitedUrls.add(url);

    if (visitedUrls.size >= nbPageLimit) {
      return;
    }

    // Fetch the page HTML
    const response = await fetch(url);
    const html = await response.text();

    const c = load(html);

    const links = c('a');

    // Follow internal links recursively
    for (const link of links) {
      if (visitedUrls.size >= nbPageLimit) {
        return;
      }

      const href = c(link).attr('href');
      // Check if link is internal
      if (href?.startsWith(startingUrl) || href?.startsWith('/')) {
        await crawl(
          href?.startsWith('/') ? path.join(startingUrl, href) : href
        );
      }
    }
  }

  // Start the crawl
  await crawl(startingUrl);

  return Array.from(visitedUrls);
};

export default findDomainPages;
