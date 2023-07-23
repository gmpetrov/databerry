import { AppDocument } from '@app/types/document';

const wordToDocs = async (buffer: Buffer) => {
  const mammoth = await import('mammoth');

  const result = await mammoth.extractRawText({ buffer });

  return [
    new AppDocument<any>({
      pageContent: result.value,
      metadata: {},
    }),
  ];
};

export default wordToDocs;
