import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { PageUnion } from '@chaindesk/lib/types';

export const allSubdomains = ['cs', 'chat', ''];
const mainDomain = 'http://localhost:3000';

const pageAllowedInSub = {
  agents: ['', 'cs'],
  analytics: ['', 'cs'],
  products: ['', 'cs'],
  settings: allSubdomains,
  datastores: ['chat', ''],
  chat: ['chat', ''],
  maintenance: allSubdomains,
  logs: ['chat', ''],
};

export function getAllowedSubdomainsForPage(page: PageUnion) {
  return pageAllowedInSub[page];
}

function useSubdomain() {
  const [subdomain, setSubdomain] = useState<string>('');
  const router = useRouter();
  useEffect(() => {
    const currentPage = router.pathname.split(
      '/'
    )[1] as keyof typeof pageAllowedInSub;
    // Split the hostname by dots to get an array of parts
    const hostnameParts = window.location.hostname.split('.');
    // If there's at least one subdomain (not the root domain or localhost)
    setSubdomain(hostnameParts[0]);
    if (hostnameParts.length >= 2 && hostnameParts[0] !== 'www') {
      // check if the domain given is within the supported subdomain
      if (allSubdomains.includes(hostnameParts[0])) {
        setSubdomain(hostnameParts[0]);
        // if the subdomain is not supported by the page redirect
        if (!pageAllowedInSub[currentPage].includes(hostnameParts[0])) {
          console.log(
            `${hostnameParts[0]} not supported by page ${currentPage}`
          );

          router.replace(mainDomain);
        }
        // if subdomain not supported redirect to main page
      } else {
        router.replace(mainDomain);
      }
    } else {
      setSubdomain('');
    }
  }, [router, subdomain]);

  return { subdomain };
}

export default useSubdomain;
