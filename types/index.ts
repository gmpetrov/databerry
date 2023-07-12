import { AppDatasource as Datasource, DatasourceType } from '@prisma/client';
import { NextApiRequest, NextPage } from 'next/types';
import { Session } from 'next-auth';
import { ReactElement, ReactNode } from 'react';

import type { Document } from '@app/utils/datastores/base';

export * from './dtos';

export enum RouteNames {
  HOME = '/agents',
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',
  AGENTS = '/agents',
  DATASTORES = '/datastores',
  LOGS = '/logs',
  CHAT = '/chat',
  MAINTENANCE = '/maintenance',
  ACCOUNT = '/account',
  APPS = '/apps',
  CHAT_SITE = '/products/crisp-plugin',
  SLACK_BOT = '/products/slack-bot',
}

export type AppNextApiRequest = NextApiRequest & {
  session: Session;
};

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export enum AppStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  KO = 'KO',
}

export enum MetadataFields {
  datastore_id = 'datastore_id',
  datasource_id = 'datasource_id',
  tags = 'tags',
  text = 'text',
  chunk_hash = 'chunk_hash',
  datasource_hash = 'datasource_hash',
  chunk_offset = 'chunk_offset',
  custom_id = 'custom_id',
}

export type DocumentMetadata = {
  datasource_id: string;
  source?: string;
  source_type: string;
  file_type?: string;
  author?: string;
  tags: string[];
  [key: string]: unknown;
};

export interface Chunk extends Document {
  metadata: DocumentMetadata & {
    datastore_id: string;
    chunk_id: string;
    chunk_hash: string;
    datasource_hash: string;
    chunk_offset: number;
  };
}

export enum TaskQueue {
  load_datasource = 'load-datasource',
}
