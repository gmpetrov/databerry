import axios from 'axios';
import { useEffect } from 'react';

import useStateReducer from './useStateReducer';

export default function usePageMetadata(url: string): {
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
} {
  const [state, setState] = useStateReducer({
    ogImage: undefined,
    ogTitle: undefined,
    ogDescription: undefined,
  });

  useEffect(() => {
    if (!url) {
      return;
    }
    const source = axios.CancelToken.source();
    const fetchOgImage = async () => {
      try {
        const response = await axios.get(`/api/og/get-metadata?url=${url}`, {
          cancelToken: source.token,
        });
        if (response.data.error) {
          return;
        }
        setState({
          ogTitle: response.data.ogTitle,
          ogDescription: response.data.ogTitle,
          ogImage: response.data.ogImage,
        });
      } catch (e) {}
    };

    fetchOgImage();

    return () => {
      source.cancel('');
    };
  }, [url]);

  return state;
}
