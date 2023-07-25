import { Datastore, DatastoreType } from '@prisma/client';
import { blake3, createBLAKE3 } from 'hash-wasm';

import { AppDocument, ChunkMetadata } from '@app/types/document';
import { SearchRequestSchema } from '@app/types/dtos';

import uuidv4 from '../uuid';

import { ClientManager } from './base';
import { QdrantManager } from './qdrant';
export class DatastoreManager {
  datastore: Datastore;
  manager: ClientManager<Datastore>;
  chunkSize: number = 256;

  managersMap = {
    [DatastoreType.qdrant]: QdrantManager,
    [DatastoreType.pinecone]: undefined as any,
  };

  constructor(datastore: Datastore) {
    this.datastore = datastore;
    this.manager = new this.managersMap[this.datastore.type](
      this.datastore as any
    ) as ClientManager<Datastore>;
  }

  async upload(documents: AppDocument[]) {
    const chunks = await this.handleSplitDocs(documents);

    return this.manager.upload(chunks);
  }

  search(props: SearchRequestSchema) {
    return this.manager.search(props);
  }

  // Delete datastore
  delete() {
    return this.manager.delete();
  }

  // Delete datasource
  remove(datasourceId: string) {
    return this.manager.remove(datasourceId);
  }

  // Documents represents multiple units (pages) from a single datasource
  static async hash(documents: AppDocument[]) {
    const document = documents?.[0];

    const tags = document?.metadata?.tags || ([] as string[]);
    const hasher = await createBLAKE3();

    hasher.init();
    hasher.update(document.metadata?.datasource_id!);
    hasher.update(documents.map((each) => each.pageContent).join(''));

    for (const tag of tags || []) {
      hasher.update(tag);
    }

    return hasher.digest('hex');
  }

  async handleSplitDocs(documents: AppDocument[]) {
    const splitters = await this.importSplitters();

    const datasource_hash = await DatastoreManager.hash(documents);

    const splits = (await new splitters.TokenTextSplitter({
      chunkSize: this.chunkSize,
    }).splitDocuments(documents)) as AppDocument<any>[];

    const chunks: AppDocument<ChunkMetadata>[] = [];

    for (const [index, each] of splits.entries()) {
      const chunk_hash = await blake3(each.pageContent);

      chunks.push({
        ...each,
        metadata: {
          ...each?.metadata,
          datastore_id: this.datastore.id,
          chunk_id: uuidv4(),
          chunk_hash,
          datasource_hash,
          chunk_offset: index,
        },
      });
    }

    return chunks;
  }

  async importSplitters() {
    return await import('langchain/text_splitter');
  }
}
