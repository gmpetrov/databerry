import axios from 'axios';

// Function to fetch the sitemap URL from the robots.txt file
async function getSitemapFromRobotsTxt(websiteUrl: string) {
  try {
    const response = await axios.get(`${websiteUrl}/robots.txt`);
    const robotsTxt = response.data;
    const sitemapLine = robotsTxt
      .split('\n')
      .find((line: string) => line.startsWith('Sitemap:'));
    if (sitemapLine) {
      return sitemapLine.split(' ')[1] as string;
    }
  } catch (error: any) {
    console.error('Error fetching robots.txt:', error?.message);
    return null;
  }
  return null;
}

// Function to fetch the sitemap.xml file directly from the website root
async function getSitemapFromRoot(websiteUrl: string) {
  try {
    const sitemapUrl = `${websiteUrl}/sitemap.xml`;
    await axios.head(sitemapUrl);
    return sitemapUrl;
  } catch (error: any) {
    console.error('Error fetching sitemap.xml:', error?.message);
  }
  return null;
}

// Main function to find the sitemap of a website
async function findSitemap(websiteUrl: string) {
  let origin = websiteUrl;
  try {
    origin = new URL(websiteUrl).origin;
  } catch {}

  // First, try to find the sitemap URL from the robots.txt file
  let sitemapUrl = await getSitemapFromRobotsTxt(origin);
  if (sitemapUrl) {
    console.log('Sitemap URL found in robots.txt:', sitemapUrl);
    return sitemapUrl;
  }

  // If not found in robots.txt, try to fetch the sitemap.xml file directly from the website root
  sitemapUrl = await getSitemapFromRoot(origin);
  if (sitemapUrl) {
    console.log('Sitemap XML found at website root:', sitemapUrl);
    return sitemapUrl;
  }

  // If both methods fail, the sitemap could not be found
  console.log('Sitemap not found');
  return null;
}

export default findSitemap;
