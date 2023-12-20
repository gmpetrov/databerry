import { ModelConfig } from '@chaindesk/lib/config';
import createPromptContext from '@chaindesk/lib/create-prompt-context';
import retrieval from '@chaindesk/lib/retrieval';
import truncateArray from '@chaindesk/lib/truncateArray';
import {
  AppDocument,
  ChunkMetadataRetrieved,
  Source,
} from '@chaindesk/lib/types/document';
import { ChatRequest } from '@chaindesk/lib/types/dtos';
import { Tool } from '@chaindesk/prisma';

type Props = Pick<ChatRequest, 'filters'> & {
  query: string;
  tools: Tool[];
  topK?: number;
  similarityThreshold?: number;
  maxTokens: number;
};

export const handler = async (props: Props) => {
  let ctx = '';

  const filterDatastoreIds = props.filters?.datastore_ids
    ? props.filters?.datastore_ids
    : props.tools
        ?.filter((each) => !!each?.datastoreId)
        ?.map((each) => each?.datastoreId);

  // Only allow datasource filtering if datastore are present
  const filterDatasourceIds =
    filterDatastoreIds?.length > 0 ? props.filters?.datasource_ids : [];

  const _filters = {
    ...props.filters,
    datastore_ids: filterDatastoreIds,
    datasource_ids: filterDatasourceIds,
  } as Props['filters'];

  const _results = (
    await retrieval({
      // datastore,
      filters: _filters,
      topK: props.topK || 5,
      query: props.query,
    })
  ).filter((each) => each.metadata.score > (props.similarityThreshold || 0));

  const results = await truncateArray<AppDocument<ChunkMetadataRetrieved>>({
    items: _results,
    getText: (item) => item.pageContent,
    setText: (item, text) => {
      return {
        ...item,
        pageContent: text,
      };
    },
    maxTokens: props.maxTokens,
  });

  const sources: Source[] = [];

  if (results?.length > 0) {
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

  const context =
    results?.length <= 0
      ? `No data found in the knowledge base`
      : createPromptContext(results);

  return {
    context,
    sources,
    rawResults: _results,
  };
};
