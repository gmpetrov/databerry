import { AppDocument, ChunkMetadataRetrieved } from './types/document';

const createPromptContext = (
  results: AppDocument<ChunkMetadataRetrieved>[]
) => {
  return results?.map((each) => `CHUNK: ${each.pageContent}`)?.join('\n');
};

export default createPromptContext;
