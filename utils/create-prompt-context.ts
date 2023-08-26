import { AppDocument, ChunkMetadataRetrieved } from '@app/types/document';

const createPromptContext = (
  results: AppDocument<ChunkMetadataRetrieved>[]
) => {
  return results?.map((each) => `CHUNK: ${each.pageContent}`)?.join('\n');
};

export default createPromptContext;
