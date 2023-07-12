import Cookies from 'js-cookie';
import { useEffect } from 'react';

import { getRootDomainFromHostname } from '@app/utils/get-root-domain';

const useUTMTracking = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = JSON.parse(Cookies.get('utmParams') || '{}');

    // Add the UTM parameters you want to track
    const utmKeys = [
      'utm_id',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ];

    utmKeys.forEach((key) => {
      if (urlParams.has(key)) {
        utmParams[key] = urlParams.get(key);
      }
    });

    Cookies.set('utmParams', JSON.stringify(utmParams), {
      domain: `.${getRootDomainFromHostname(window.location.hostname)}`,
      path: '/',
    });
  }, []);
};

export default useUTMTracking;
