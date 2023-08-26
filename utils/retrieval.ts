import { Datastore } from '@prisma/client';

import { AppDocument, ChunkMetadataRetrieved } from '@app/types/document';
import { ChatRequest } from '@app/types/dtos';

import { QdrantManager } from './datastores/qdrant';
import { DatastoreManager } from './datastores';

type RetrievalProps = {
  query: string;
  topK: number;
  datastore?: Datastore;
  filters?: ChatRequest['filters'];
};

const retrieval = async (props: RetrievalProps) => {
  let results: AppDocument<ChunkMetadataRetrieved>[] = [];

  if (props.datastore) {
    const store = new DatastoreManager(props.datastore);
    results = await store.search({
      query: props.query,
      topK: props.topK,
      filters: props.filters,
      tags: [],
    });
  } else if (
    props.filters?.datasource_ids?.length ||
    props.filters?.datastore_ids?.length
  ) {
    // Support for Multi-datastore search
    // TODO: need to be refactored if other vector db provider are used in the future
    results = await QdrantManager._search({
      query: props.query,
      topK: props.topK,
      filters: props.filters,
      tags: [],
    });
  }

  // return results;
  // Sort by order of appearance in the document
  return results.sort(
    (a, b) => a.metadata.chunk_offset! - b.metadata.chunk_offset!
  );
};

export default retrieval;
