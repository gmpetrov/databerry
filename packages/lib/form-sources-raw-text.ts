import { Source } from './types/document';

const formatSourceRawText = (sources?: Source[]) => {
  const filtered = (sources || [])
    .map((source) => `${source.source_url}`)
    .filter((source) => !!source);

  if (filtered.length <= 0) {
    return '';
  }

  return `Sources\n${filtered.join('\n')}`;
};

export default formatSourceRawText;
