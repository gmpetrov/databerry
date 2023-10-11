import { DOMParser } from '@xmldom/xmldom';
import axios from 'axios';
import { load } from 'cheerio';
import pTimeout from 'p-timeout';
import path from 'path';

import addSlashUrl from './add-slash-url';

export const getUrlsFromSitemap = (data: any) => {
  const pages: string[] = [];
  const sitemaps: string[] = [];
  const parser = new DOMParser();
  const xmlDom = parser.parseFromString(data, 'text/xml');
  const urlElements = xmlDom.getElementsByTagName('url');
  const sitemapElements = xmlDom.getElementsByTagName('sitemap');

  for (let i = 0; i < urlElements.length; i++) {
    const locs = urlElements[i].getElementsByTagName('loc');

    for (let j = 0; j < locs.length; j++) {
      const url = locs[j].textContent;

      if (url) {
        pages.push(url);
      }
    }
  }

  for (let i = 0; i < sitemapElements.length; i++) {
    const locs = sitemapElements[i].getElementsByTagName('loc');

    for (let j = 0; j < locs.length; j++) {
      const url = locs[j].textContent;

      if (url) {
        sitemaps.push(url);
      }
    }
  }

  return {
    pages,
    sitemaps,
  };
};

export const getSitemapPages = async (
  sitemapURL: string,
  maxPages?: number
) => {
  const pages = [] as string[];
  try {
    const getUrls = async (sitemap: string) => {
      let content = '';
      try {
        if (maxPages && pages.length >= maxPages) {
          return;
        }

        const { data } = await axios.get(sitemap);

        if (!data) {
          throw 'empty data';
        }

        content = data;
      } catch (err) {
        console.log(err);

        const res = await axios.get(
          `${process.env.BROWSER_API}?url=${sitemap}`
        );

        content = res?.data?.result || '';
      }

      const res = getUrlsFromSitemap(content);

      for (const each of res.pages) {
        pages.push(each);

        if (maxPages && pages.length >= maxPages) {
          return;
        }
      }

      for (const each of res.sitemaps) {
        await getUrls(each);
      }
    };

    await getUrls(sitemapURL);
  } catch (err) {
    console.log('err', err);
  }

  return {
    pages,
    sitemaps: [],
  };
};

const findDomainPages = async (startingUrl: string, nbPageLimit = 25) => {
  // Create a set to track visited URLs
  const visitedUrls = new Set<string>();
  const origin = new URL(startingUrl).origin;
  const hostname = new URL(startingUrl).hostname;

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
    // const response = await fetch(url);
    // const html = await response.text();
    const response = await axios(addSlashUrl(url), {
      headers: {
        'User-Agent': Date.now().toString(),
      },
    });
    const html = response.data;

    const c = load(html);

    const links = c('a');

    // Follow internal links recursively
    for (const link of links) {
      if (visitedUrls.size >= nbPageLimit) {
        return;
      }

      const href = c(link).attr('href');

      let linkHostname = undefined;
      try {
        linkHostname = new URL(href!).hostname;
      } catch {}

      if (href?.startsWith('/') || linkHostname === hostname) {
        const url = href?.startsWith('/') ? origin + href : href;

        await crawl(url!);
      }
    }
  }

  // Start the crawl
  try {
    await pTimeout(crawl(startingUrl), {
      //  STOP AFTER 45 SECONDS OTHERWISE LAMBDA WILL TIMEOUT AFTER 60 SECONDS
      milliseconds: 60000,
    });
  } catch {}

  return Array.from(visitedUrls);
};

export default findDomainPages;
