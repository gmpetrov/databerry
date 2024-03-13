const getUTMparamsForPath = ({
  pathname,
}: {
  pathname: string;
}): Record<string, string> => {
  if (pathname.startsWith('/tools/youtube-summarizer/')) {
    return {
      utm_source: 'landing_page',
      utm_medium: 'tool',
      utm_campaign: 'youtube_summarizer',
      utm_term: pathname.replace(/\/tools\/youtube-summarizer\/?/, ''),
    };
  }

  return {};
};

export default getUTMparamsForPath;
