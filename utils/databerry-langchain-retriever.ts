import { Datastore } from '@prisma/client';

import { DatastoreManager } from './datastores';

export default class ChaindeskRetriever {
  datastore: Datastore;
  topK: number;

  constructor({ datastore, topK }: { datastore: Datastore; topK?: number }) {
    this.datastore = datastore;
    this.topK = topK || 5;
  }

  async getRelevantDocuments(query: string, topK?: number): Promise<any[]> {
    const store = new DatastoreManager(this.datastore);

    const results = await store.search({
      query: query,
      topK: topK || this.topK,
      tags: [],
    });

    const docs = results.map((each) => ({
      metadata: {
        source: each?.source,
        score: each?.score,
      } as any,
      pageContent: `Content: ${each?.text}
  Source: ${each?.source}
  `,
    }));

    return docs;
  }
}
