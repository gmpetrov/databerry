import { DatastoreType } from '@chaindesk/prisma';

import QdrantForm from './QdrantForm';

export const DatastoreFormsMap = {
  [DatastoreType.pinecone]: undefined as any,
  [DatastoreType.qdrant]: QdrantForm,
};
