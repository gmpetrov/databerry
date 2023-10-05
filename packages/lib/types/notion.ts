import { Client } from '@notionhq/client';

export type NotionBlocks = Pick<
  Awaited<ReturnType<Client['blocks']['children']['list']>>,
  'results'
>['results'];

export type NotionPages = Pick<
  Awaited<ReturnType<Client['search']>>,
  'results'
>;
