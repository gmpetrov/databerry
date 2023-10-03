import { TokenTextSplitter } from 'langchain/text_splitter';

const splitTextByToken = async ({
  text,
  chunkSize,
  chunkOverlap,
}: {
  text: string;
  chunkSize: number;
  chunkOverlap?: number;
}) => {
  const splitter = new TokenTextSplitter({
    chunkSize,
    chunkOverlap: chunkOverlap || 0,
  });

  return splitter.splitText(text);
};

export default splitTextByToken;
