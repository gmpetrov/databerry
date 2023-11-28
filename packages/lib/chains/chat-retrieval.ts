import {
  AppDocument,
  ChunkMetadataRetrieved,
  Source,
} from '@chaindesk/lib/types/document';
import { ChatRequest } from '@chaindesk/lib/types/dtos';
import { Datastore, MessageFrom } from '@chaindesk/prisma';

import chat, { ChatProps } from '../chatv2';
import { ModelConfig } from '../config';
import createPromptContext from '../create-prompt-context';
import retrieval from '../retrieval';
import truncateArray from '../truncateArray';

export type ChatRetrievalChainProps = Omit<ChatProps, 'prompt'> & {
  datastore?: Datastore;
  topK?: number;
  filters?: ChatRequest['filters'];
  includeSources?: boolean;
  retrievalSearch?: string;
  getPrompt: (chunks: AppDocument<ChunkMetadataRetrieved>[]) => string;
};

/*
    - retrieval
    - chat request
    - source generation
    - output
  */
const chatRetrieval = async ({
  topK,
  stream,
  history,
  filters,
  modelName,
  datastore,
  includeSources,
  retrievalSearch,
  initialMessages,
  getPrompt,
  abortController,
  ...otherProps
}: ChatRetrievalChainProps) => {
  const _results = retrievalSearch
    ? await retrieval({
        datastore,
        filters,
        topK: topK || 5,
        query: retrievalSearch,
      })
    : [];

  const results = await truncateArray<AppDocument<ChunkMetadataRetrieved>>({
    items: _results,
    getText: (item) => item.pageContent,
    setText: (item, text) => {
      return {
        ...item,
        pageContent: text,
      };
    },
    maxTokens: ModelConfig?.[modelName!]?.maxTokens * 0.2,
  });

  const prompt = getPrompt(results);

  // Generate answer
  const { answer, usage } = await chat({
    modelName,
    prompt,
    stream,
    history,
    // history: [
    //   ...(history || []),
    //   {
    //     id: '42',
    //     from: 'function',
    //     text: createPromptContext(
    //       results.filter((each) => each.metadata.score! > 0.7)
    //     ),
    //   } as any,
    // ],
    // TODO: Find better way to inject context
    context: createPromptContext(
      results.filter((each) => each.metadata.score! > 0.7)
    ),
    initialMessages,
    abortController,
    ...otherProps,
  });

  // Generate sources
  const sources: Source[] = [];

  if (includeSources && results?.length > 0) {
    results
      .sort((a, b) => b.metadata.score! - a.metadata.score!)
      .map((each) => ({
        chunk_id: each.metadata.chunk_id,
        custom_id: each.metadata.custom_id,
        datasource_id: each.metadata.datasource_id!,
        datasource_name: each.metadata.datasource_name!,
        datasource_type: each.metadata.datasource_type!,
        source_url: each.metadata.source_url!,
        mime_type: each.metadata.mime_type!,
        page_number: each.metadata.page_number!,
        total_pages: each.metadata.total_pages!,
        score: each.metadata.score!,
      }))
      .forEach((each) => {
        if (!sources.find((one) => one.datasource_id === each.datasource_id)) {
          sources.push(each);
        }
      });
  }

  return {
    answer,
    sources,
    usage,
  };
};

export default chatRetrieval;
