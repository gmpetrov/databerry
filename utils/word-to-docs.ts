import { AppDocument } from '@app/types/document';

import cleanTextForEmbeddings from './clean-text-for-embeddings';

const wordToDocs = async (buffer: Buffer) => {
  const mammoth = await import('mammoth');

  const result = await mammoth.extractRawText({ buffer });

  return [
    new AppDocument<any>({
      pageContent: cleanTextForEmbeddings(result.value),
      metadata: {},
    }),
  ];
};

export default wordToDocs;
