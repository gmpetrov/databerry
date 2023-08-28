import { NextApiRequest, NextPage } from 'next/types';
import { Session } from 'next-auth';
import { ReactElement, ReactNode } from 'react';

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

export enum PromptTypesLabels {
  customer_support = 'Customer support',
  raw = 'Raw',
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
  page_number = 'page_number',
  total_pages = 'total_pages',
}

export enum TaskQueue {
  load_datasource = 'load-datasource',
}

export enum SSE_EVENT {
  answer = 'answer',
  endpoint_response = 'endpoint_response',
  step = 'step',
}

export enum ChainType {
  qa = 'qa',
}
