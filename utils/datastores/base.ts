import type { Datastore } from '@prisma/client';
import { Document as LangchainDocument } from 'langchain/document';

import { Chunk, DocumentMetadata, SearchRequestSchema } from '@app/types';

export const INDEX_NAME = 'databerry';

export class Document extends LangchainDocument {
  metadata: DocumentMetadata;

  constructor(props: Document) {
    super(props);
  }
}

export abstract class ClientManager<T extends Datastore> {
  datastore: T;

  constructor(datastore: T) {
    this.datastore = datastore;
  }

  abstract upload(documents: Document[]): Promise<Chunk[]>;
  abstract remove(datasourceId: string): Promise<any>;
  abstract delete(): Promise<any>;
  abstract search(props: SearchRequestSchema): Promise<
    {
      text: string;
      source: string;
      score: number;
    }[]
  >;
}
