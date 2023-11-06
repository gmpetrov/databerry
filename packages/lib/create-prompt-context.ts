import { AppDocument, ChunkMetadataRetrieved } from './types/document';

const createPromptContext = (
  results: AppDocument<ChunkMetadataRetrieved>[]
) => {
  return results
    ?.map((each) =>
      [
        `CHUNK_FROM: ${each.metadata.datasource_name}`,
        ...(each.metadata.tags && each.metadata.tags.length > 0
          ? [`CHUNK_TAGS: ${each.metadata.tags.join(', ')}`]
          : []),
        `CHUNK_CONTENT: ${each.pageContent}`,
      ].join('\n')
    )
    ?.join('\n');
};

export default createPromptContext;
