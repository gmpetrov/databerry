import { Source } from '@app/types/document';

const formatSourceRawText = (sources?: Source[]) => {
  if (!sources || sources?.length <= 0) return '';
  return `Sources\n${sources
    .map((source) => `${source.source_url}`)
    .filter((source) => !!source)
    .join('\n')}`;
};

export default formatSourceRawText;
