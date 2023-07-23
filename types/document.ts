import { DatasourceType } from '@prisma/client';
import { Document as LangchainDocument } from 'langchain/document';
import { z } from 'zod';

export const BaseDocumentMetadataSchema = z.object({
  datastore_id: z.string().cuid(),
  datasource_id: z.string().cuid(),
  datasource_type: z.nativeEnum(DatasourceType),
  datasource_name: z.string(),
  source_url: z.string().url(),
  custom_id: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
});

export const FileMetadataSchema = BaseDocumentMetadataSchema.extend({
  datasource_type: z.union([
    z.literal(DatasourceType.file),
    z.literal(DatasourceType.google_drive_file),
  ]),

  // TODO: Rename to mime_type
  mime_type: z.string(),
  page_number: z.number().optional(),
  total_pages: z.number().optional(),
});

export const ChunkMetadataSchema = z.object({
  chunk_id: z.string(),
  chunk_hash: z.string(),
  datasource_hash: z.string(),
  chunk_offset: z.number(),
});

export const Source = FileMetadataSchema.pick({
  datasource_id: true,
  datasource_name: true,
  datasource_type: true,
  source_url: true,
  page_number: true,
  total_pages: true,
  mime_type: true,
}).extend({
  chunk_id: z.string(),
  score: z.number().optional(),
});

export type Source = z.infer<typeof Source>;

export type BaseDocumentMetadataSchema = z.infer<
  typeof BaseDocumentMetadataSchema
>;
export type FileMetadataSchema = z.infer<typeof FileMetadataSchema>;
export type ChunkMetadataSchema = z.infer<typeof ChunkMetadataSchema>;
export type DocumentMetadataSchema =
  | BaseDocumentMetadataSchema
  | FileMetadataSchema;

export type ChunkMetadata = BaseDocumentMetadataSchema &
  FileMetadataSchema &
  ChunkMetadataSchema;

export type ChunkMetadataRetrieved = ChunkMetadata & {
  score: number;
};

export class AppDocument<
  T extends BaseDocumentMetadataSchema = BaseDocumentMetadataSchema
> extends LangchainDocument {
  metadata: T;

  constructor(props: { pageContent: string; metadata: T }) {
    super(props);
  }
}
