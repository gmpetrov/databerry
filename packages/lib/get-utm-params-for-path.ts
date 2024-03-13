const getUTMparamsForPath = ({
  pathname,
}: {
  pathname: string;
}): Record<string, string> => {
  if (pathname.startsWith('/tools/youtube-summarizer')) {
    return {
      utm_source: 'landing_page',
      utm_medium: 'tool',
      utm_campaign: 'youtube_summarizer',
      utm_term: pathname.replace(/\/tools\/youtube-summarizer\/?/, ''),
    };
  }
  if (pathname.startsWith('/ai-news')) {
    return {
      utm_source: 'landing_page',
      utm_medium: 'tool',
      utm_campaign: 'ai_news',
      utm_term: pathname.replace(/\/ai-news\/?/, ''),
    };
  }

  return {};
};

export default getUTMparamsForPath;
