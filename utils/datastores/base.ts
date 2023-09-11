import type { Datastore } from '@prisma/client';

import {
  AppDocument,
  ChunkMetadata,
  ChunkMetadataRetrieved,
} from '@app/types/document';
import { SearchRequestSchema } from '@app/types/dtos';

export const INDEX_NAME = 'databerry';

export abstract class ClientManager<T extends Datastore> {
  datastore: T;

  constructor(datastore: T) {
    this.datastore = datastore;
  }

  abstract upload(
    documents: AppDocument<ChunkMetadata>[]
  ): Promise<AppDocument<ChunkMetadata>[]>;
  abstract remove(datasourceId: string): Promise<any>;
  abstract removeBulk(datasourceIds: string[]): Promise<any>;
  abstract delete(): Promise<any>;
  abstract search(
    props: SearchRequestSchema
  ): Promise<AppDocument<ChunkMetadataRetrieved>[]>;
  abstract getChunk(
    chunkId: string
  ): Promise<AppDocument<ChunkMetadataRetrieved>>;
}
