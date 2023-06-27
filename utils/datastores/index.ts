import { Datastore, DatastoreType } from '@prisma/client';
import { blake3, createBLAKE3 } from 'hash-wasm';

import { Chunk, SearchRequestSchema } from '@app/types';
import type { Document } from '@app/utils/datastores/base';

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

  async upload(document: Document) {
    const chunks = await this.handleSplitDocument(document);

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

  static async hash(document: Document) {
    const tags = document.metadata?.tags || ([] as string[]);
    const hasher = await createBLAKE3();
    hasher.init();
    hasher.update(document.metadata?.datasource_id);
    hasher.update(document.pageContent);

    for (const tag of tags || []) {
      hasher.update(tag);
    }

    return hasher.digest('hex');
  }

  async handleSplitDocument(document: Document) {
    const splitters = await this.importSplitters();

    const datasource_hash = await DatastoreManager.hash(document);

    const docs = (await new splitters.TokenTextSplitter({
      chunkSize: this.chunkSize,
    }).splitDocuments([document])) as Document[];

    const chunks: Chunk[] = [];

    for (const [index, each] of docs.entries()) {
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
