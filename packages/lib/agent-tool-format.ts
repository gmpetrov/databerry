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

export const agentToolConfig = {
  [ToolType.datastore]: {
    icon: '🧠',
    title: `🧠 Datastore`,
    description: `Connect custom data to your Agent`,
  },
  [ToolType.http]: {
    icon: '🛜',
    title: '🛜 HTTP Tool',
    description: `Agent can perform an HTTP request to an external API`,
  },
  [ToolType.form]: {
    icon: '📋',
    title: '📋 Form',
    description: `Connect a form to your Agent`,
  },
  [ToolType.mark_as_resolved]: {
    icon: '✅',
    title: '✅ Mark as Resolved',
    description: `Agent can mark the conversation as resolved when relevant`,
  },
  [ToolType.request_human]: {
    icon: '🙋‍♂️',
    title: '🙋‍♂️ Request Human',
    description: `Agent can mark the conversation as resolved when relevant`,
  },
  [ToolType.lead_capture]: {
    icon: '🎯',
    title: '🎯 Lead Capture',
    description: `Agent can collect user email or phone number`,
  },
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

  const icon = (agentToolConfig as any)?.[tool.type]?.icon as string;

  if (tool.type === ToolType.datastore) {
    format = {
      id: tool.id!,
      datastoreId: tool.datastoreId!,
      name:
        ((tool as any)?.datastore?.name!
          ? `${icon} ` + (tool as any)?.datastore?.name!
          : undefined) || agentToolConfig[ToolType.datastore].description,
      description:
        ((tool as any)?.datastore?.description as string) ||
        agentToolConfig[ToolType.datastore].description,
    };
  } else if (tool.type === ToolType.http) {
    format = {
      id: tool.id!,
      name:
        (tool?.config?.name ? `${icon} ` + tool?.config?.name : undefined) ||
        agentToolConfig[ToolType.http].title,
      description:
        tool?.config?.description || agentToolConfig[ToolType.http].description,
    };
  } else if (tool.type === ToolType.form) {
    format = {
      id: tool.id!,
      formId: tool?.formId,
      name:
        (tool?.form?.name ? `${icon} ` + tool?.form?.name : undefined) ||
        agentToolConfig[ToolType.form].title,
      description:
        tool?.form?.description || agentToolConfig[ToolType.form].description,
    };
  } else {
    format = {
      id: tool.id!,
      name: (agentToolConfig as any)[tool?.type]?.title || tool.type,
      description: (agentToolConfig as any)[tool?.type]?.description || '',
    };
  }

  return {
    ...tool,
    ...format,
  };
};

export default agentToolFormat;
