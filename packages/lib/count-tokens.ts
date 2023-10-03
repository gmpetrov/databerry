import { get_encoding, TiktokenEncoding } from '@dqbd/tiktoken';

const countTokens = ({
  text,
  encodingName,
}: {
  text: string;
  encodingName?: TiktokenEncoding;
}) => {
  const encoding = get_encoding(encodingName || 'cl100k_base');
  const nbTokens = encoding.encode(text).length;
  encoding.free();

  return nbTokens;
};

export default countTokens;
