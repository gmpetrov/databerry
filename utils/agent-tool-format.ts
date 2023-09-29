import { Datastore, Tool, ToolType } from '@prisma/client';

import cuid from '@app/utils/cuid';

export type NormalizedTool = {
  id?: string;
  type: ToolType;
  name?: string;
  description?: string;
};

interface CreateDatastoreTool extends NormalizedTool {
  type: 'datastore';
  datastoreId: string;
}

export const createTool = (payload: CreateDatastoreTool) => ({
  ...payload,
  id: payload?.id || cuid(),
});

const agentToolFormat = (
  tool: Tool & {
    datastore: Datastore | null;
  }
) => {
  let format = {};

  if (tool.type === ToolType.datastore) {
    format = {
      id: tool.id!,
      datastoreId: tool.datastoreId!,
      name: tool?.datastore?.name!,
      description: tool?.datastore?.description,
    };
  }

  return {
    ...tool,
    ...format,
  } as NormalizedTool & Tool;
};

export default agentToolFormat;
