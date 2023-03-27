import { DatastoreType } from '@prisma/client';

import QdrantForm from './QdrantForm';

export const DatastoreFormsMap = {
  [DatastoreType.pinecone]: undefined as any,
  [DatastoreType.qdrant]: QdrantForm,
};
