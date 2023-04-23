import { Datastore, Tool, ToolType } from '@prisma/client';

const agentToolFormat = (
  tool: Tool & {
    datastore: Datastore | null;
  }
) => {
  let format = {};

  if (tool.type === ToolType.datastore) {
    format = {
      id: tool.datastoreId,
      name: tool?.datastore?.name,
      description: tool?.datastore?.description,
    };
  }

  return {
    ...tool,
    ...format,
  };
};

export default agentToolFormat;
