import { Datastore } from '@prisma/client';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Embeddings } from 'langchain/embeddings';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { z } from 'zod';

import { MetadataFields } from '@app/types';
import {
  AppDocument,
  ChunkMetadata,
  ChunkMetadataRetrieved,
} from '@app/types/document';
import { SearchRequestSchema } from '@app/types/dtos';
import { QdrantConfigSchema } from '@app/types/models';

import { embedDocuments as embedDocumentsMock } from '../mocks';
import uuidv4 from '../uuid';

import { ClientManager } from './base';

type DatastoreType = Datastore & {
  config: z.infer<typeof QdrantConfigSchema>;
};

export type Point = {
  id: string;
  vector: number[];
  score?: number;
  // payload: Omit<DocumentSchema['metadata'], 'chunk_id'> & {
  payload: ChunkMetadata & {
    text: string;
  };
};

const initEmbeddingModel = () => {
  const embeddings = new OpenAIEmbeddings();

  if (process.env.APP_ENV === 'test') {
    embeddings.embedDocuments = embedDocumentsMock;
  }

  return embeddings;
};

const initHTTPClient = () =>
  axios.create({
    baseURL: process.env.QDRANT_API_URL,
    headers: {
      'api-key': process.env.QDRANT_API_KEY,
    },
  });

export class QdrantManager extends ClientManager<DatastoreType> {
  client: AxiosInstance;
  embeddings: Embeddings;

  constructor(datastore: DatastoreType) {
    super(datastore);

    this.embeddings = initEmbeddingModel();
    this.client = initHTTPClient();
  }

  private async initAppCollection() {
    await this.client.put(`/collections/text-embedding-ada-002`, {
      name: 'text-embedding-ada-002',
      hnsw_config: {
        payload_m: 16,
        m: 0,
      },
      optimizers_config: {
        memmap_threshold: 10000,
      },
      vectors: {
        size: 1536,
        distance: 'Cosine',
      },
      on_disk_payload: true,
    });

    await this.client.put(`/collections/text-embedding-ada-002/index`, {
      field_name: MetadataFields.datastore_id,
      field_schema: 'keyword',
    });

    await this.client.put(`/collections/text-embedding-ada-002/index`, {
      field_name: MetadataFields.datasource_id,
      field_schema: 'keyword',
    });

    await this.client.put(`/collections/text-embedding-ada-002/index`, {
      field_name: MetadataFields.tags,
      field_schema: 'keyword',
    });

    await this.client.put(`/collections/text-embedding-ada-002/index`, {
      field_name: MetadataFields.custom_id,
      field_schema: 'keyword',
    });
  }

  private async addDocuments(
    documents: AppDocument<ChunkMetadata>[],
    ids?: string[]
  ): Promise<void> {
    const texts = documents.map(({ pageContent }) => pageContent);
    return this.addVectors(
      await this.embeddings.embedDocuments(texts),
      documents,
      ids
    );
  }

  private async addVectors(
    vectors: number[][],
    documents: AppDocument<ChunkMetadata>[],
    ids?: string[]
  ): Promise<void> {
    const documentIds = ids == null ? documents.map(() => uuidv4()) : ids;
    const qdrantVectors = vectors.map(
      (vector, idx) =>
        ({
          id: documentIds[idx],
          payload: {
            datastore_id: this.datastore.id,
            text: documents[idx].pageContent,
            source_url: documents[idx].metadata.source_url,
            datasource_type: documents[idx].metadata.datasource_type,
            tags: documents[idx].metadata.tags,
            chunk_hash: documents[idx].metadata.chunk_hash,
            chunk_offset: documents[idx].metadata.chunk_offset,
            datasource_hash: documents[idx].metadata.datasource_hash,
            datasource_id: documents[idx].metadata.datasource_id,
            datasource_name: documents[idx].metadata.datasource_name,
            custom_id: documents[idx].metadata.custom_id,
            mime_type: documents[idx].metadata.mime_type,
            page_number: documents[idx].metadata.page_number,
            total_pages: documents[idx].metadata.total_pages,
          },
          vector,
        } as Point)
    );

    const chunkSize = 50;
    for (let i = 0; i < qdrantVectors.length; i += chunkSize) {
      const chunk = qdrantVectors.slice(i, i + chunkSize);
      await this.client.put(`/collections/text-embedding-ada-002/points`, {
        points: chunk,
      });
    }
  }

  //  Delete points related to a Datastore
  async delete() {
    return this.client.post(
      `/collections/text-embedding-ada-002/points/delete`,
      {
        filter: {
          must: [
            {
              key: MetadataFields.datastore_id,
              match: { value: this.datastore.id },
            },
          ],
        },
      }
    );
  }

  //  Delete points related to a Datasource
  async remove(datasourceId: string) {
    return this.client.post(
      `/collections/text-embedding-ada-002/points/delete`,
      {
        filter: {
          must: [
            {
              key: MetadataFields.datasource_id,
              match: {
                value: datasourceId,
              },
            },
          ],
        },
      }
    );
  }

  async upload(documents: AppDocument<ChunkMetadata>[]) {
    const ids: string[] = documents.map((each) => each.metadata.chunk_id!);
    const datasourceId = documents[0].metadata.datasource_id;

    try {
      await this.remove(datasourceId!);
      await this.addDocuments(documents, ids);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if ((error as AxiosError).response?.status === 404) {
          // Collection does not exist, create it
          await this.initAppCollection();
          await this.addDocuments(documents, ids);
        }
      } else {
        console.log(error);
        throw error;
      }
    }

    return documents;
  }

  static async _search(props: SearchRequestSchema & { datastore_id?: string }) {
    const vectors = await initEmbeddingModel().embedDocuments([props.query]);
    const results = await initHTTPClient().post(
      `/collections/text-embedding-ada-002/points/search`,
      {
        vector: vectors[0],
        limit: props.topK,
        with_payload: true,
        with_vectors: false,
        filter: {
          must: [
            ...(props.datastore_id
              ? [
                  {
                    key: MetadataFields.datastore_id,
                    match: { value: props.datastore_id },
                  },
                ]
              : []),
            ...(props.filters?.custom_id
              ? [
                  {
                    key: MetadataFields.custom_id,
                    match: { value: props.filters.custom_id },
                  },
                ]
              : []),
            ...(props.filters?.datasource_id
              ? [
                  {
                    key: MetadataFields.datasource_id,
                    match: { value: props.filters.datasource_id },
                  },
                ]
              : []),
          ],
          should: [
            ...(props.filters?.custom_ids || [])?.map((each) => ({
              key: MetadataFields.custom_id,
              match: { value: each },
            })),
            ...(props.filters?.datasource_ids || [])?.map((each) => ({
              key: MetadataFields.datasource_id,
              match: { value: each },
            })),
            ...(props.filters?.datastore_ids || [])?.map((each) => ({
              key: MetadataFields.datastore_id,
              match: { value: each },
            })),
          ],
        },
      }
    );

    return (results.data?.result || []).map((each: Point) => {
      const { text, ...metadata } = each?.payload;
      return new AppDocument<ChunkMetadataRetrieved>({
        pageContent: text,
        metadata: {
          ...metadata,
          chunk_id: each?.id,
          score: each?.score!,
        },
      });
    }) as AppDocument<ChunkMetadataRetrieved>[];
  }

  async search(props: SearchRequestSchema) {
    return QdrantManager._search({
      ...props,
      datastore_id: this.datastore.id,
    });
  }

  async getChunk(chunkId: string) {
    const result = await initHTTPClient().get(
      `/collections/text-embedding-ada-002/points/${chunkId}`
    );

    const point = result.data?.result as Point;

    const { text, ...metadata } = point?.payload;
    return new AppDocument<ChunkMetadataRetrieved>({
      pageContent: text,
      metadata: {
        ...metadata,
        chunk_id: point?.id,
        score: point?.score!,
      },
    });
  }
}
