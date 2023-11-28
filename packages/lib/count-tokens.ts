import { getEncoding, TiktokenEncoding } from 'js-tiktoken';

const countTokens = ({
  text,
  encodingName,
}: {
  text: string;
  encodingName?: TiktokenEncoding;
}) => {
  const encoding = getEncoding(encodingName || 'cl100k_base');
  const nbTokens = encoding.encode(text).length;
  // encoding.free();

  return nbTokens;
};

export const countTokensEstimation = ({ text }: { text: string }) => {
  return text?.length / 4;
};

export default countTokens;
