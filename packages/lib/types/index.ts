import { NextApiRequest, NextPage } from 'next/types';
import { Session } from 'next-auth';
import type { Logger } from 'pino';
import { ReactElement, ReactNode } from 'react';

import { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import { Source } from '@chaindesk/lib/types/document';
import {
  ActionApproval,
  Agent,
  Attachment,
  Conversation,
  FormSubmission,
  LLMTaskOutput,
  Message,
  ServiceProvider,
  ServiceProviderType,
} from '@chaindesk/prisma';

export enum RouteNames {
  HOME = '/agents',
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',
  AGENTS = '/agents',
  AGENT = '/agents/[agentId]',
  DATASTORES = '/datastores',
  DATASTORE = '/datastores/[datastoreId]',
  DATASOURCE = '/datastores/[datastoreId]/[datasourceId]',
  LOGS = '/logs',
  CHAT = '/chat',
  MAINTENANCE = '/maintenance',
  SETTINGS = '/settings',
  BILLING = '/settings/billing',
  PROFILE = '/settings/profile',
  APPS = '/apps',
  CHAT_SITE = '/products/crisp-plugin',
  SLACK_BOT = '/products/slack-bot',
  FORMS = '/forms',
  ANALYTICS = '/analytics',
  EMAIL_INBOXES = '/mail-inboxes',
  CONTACTS = '/contacts',
}

export enum PromptTypesLabels {
  customer_support = 'Customer support',
  raw = 'Raw',
}

export type AppNextApiRequest = NextApiRequest & {
  session: Session;
  requestId?: string;
  logger: Logger;
};

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
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
  tool_call = 'tool_call',
  endpoint_response = 'endpoint_response',
  step = 'step',
  metadata = 'metadata',
}

export enum ChainType {
  qa = 'qa',
}

export enum AppEventType {
  MARKED_AS_RESOLVED = 'MAKRED_AS_RESOLVED',
  HUMAN_REQUESTED = 'HUMAN_REQUESTED',
}

export type AppEvent =
  | {
      type: AppEventType.HUMAN_REQUESTED;
      payload: {
        agent: Agent;
        visitorEmail: string;
        conversation: Conversation;
        messages: Message[];
        credentials: ServiceProvider;
      };
    }
  | {
      type: AppEventType.MARKED_AS_RESOLVED;
      payload: {
        agent: Agent;
        visitorEmail: string;
        conversation: Conversation;
        messages: Message[];
        credentials: ServiceProvider;
      };
    };

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Metadata {
  title: string;
  channelId: string;
  thumbnails: {
    high: Thumbnail;
    medium: Thumbnail;
    default: Thumbnail;
  };
  description: string;
  publishTime: string;
  publishedAt: string;
  channelTitle: string;
  liveBroadcastContent: string;
  category?: string;
  keywords?: string[];
  author_name?: string;
  author_url?: string;
}

export type SummaryPageProps = LLMTaskOutput & {
  output: {
    ['en']: Schema & {
      videoSummary?: string;
      faq?: { q: string; a: string }[];
    };
  } & {
    metadata: Metadata;
  };
};

export type WebPageSummaryMetadata = {
  title: string;
  description: string;
  ogImage: string;
  host: string;
  url: string;
};

export type WebPageSummary = LLMTaskOutput & {
  output: {
    ['en']: SummaryPageProps['output']['en'] & {};
  } & {
    metadata: WebPageSummaryMetadata;
  };
};

export type Product = {
  slug: string;
  name: string;
  title: string;
  description: string;
  icon?: any;
  metadata?: {
    title?: string;
    description?: string;
  };
  logo: string;
  cta?: {
    label: string;
    url: string;
  };
  cta2?: {
    label: string;
    url: string;
  };
  youtubeVideoId?: string;
  imageUrl?: string;

  features?: {
    label?: string;
    title?: string;
    description?: string;
    items?: {
      name: string;
      description: string;
    }[];
  };

  // labelFeatures?: string;
  // titleFeatures?: string;
  // descriptionFeatures?: string;
  // features?: {
  //   name: string;
  //   description: string;
  // }[];

  isChannel?: boolean;
  isDatasource?: boolean;
  isComingSoon?: boolean;
  keywords?: string[];
};

export type MessageEvalUnion = 'good' | 'bad';

export type ChatMessage = {
  id?: string;
  conversationId?: string;
  eval?: MessageEvalUnion | null;
  from: 'human' | 'agent';
  message: string;
  createdAt?: Date;
  sources?: Source[];
  component?: JSX.Element;
  disableActions?: boolean;
  step?: {
    type: 'tool_call';
    description?: string;
  };
  approvals: ActionApproval[];
  metadata?: Record<string, any>;
  attachments?: Attachment[];
  submission?: FormSubmission;
  iconUrl?: string;
  fromName?: string;
};
