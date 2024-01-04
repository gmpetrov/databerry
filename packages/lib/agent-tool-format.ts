import cuid from 'cuid';

import { Datastore, Tool, ToolType } from '@chaindesk/prisma';

import { ToolSchema } from './types/dtos';

// export type NormalizedTool = {
//   id?: string;
//   type: ToolType;
//   name?: string;
//   description?: string;
// };

// interface CreateDatastoreTool extends NormalizedTool {
//   type: 'datastore';
//   datastoreId: string;
// }

export type NormalizedTool = {
  id?: string;
  type: ToolType;
  name?: string;
  description?: string;
};

export const createTool = (payload: ToolSchema) => ({
  ...payload,
  id: payload?.id || cuid(),
});

const agentToolFormat = (tool: ToolSchema) => {
  let format = {
    name: tool.type,
    description: '',
  } as any;

  if (tool.type === ToolType.datastore) {
    format = {
      id: tool.id!,
      datastoreId: tool.datastoreId!,
      name: (tool as any)?.datastore?.name!,
      description: (tool as any)?.datastore?.description as string,
    };
  } else if (tool.type === ToolType.http) {
    format = {
      id: tool.id!,
      name: tool?.config?.name || 'HTTP Tool',
      description: tool?.config?.description,
    };
  } else if (tool.type === ToolType.form) {
    format = {
      id: tool.id!,
      formId: tool?.formId,
      name: tool?.form?.name || 'Form Tool',
      description: tool?.form?.description,
    };
  }

  return {
    ...tool,
    ...format,
  };
};

export default agentToolFormat;
