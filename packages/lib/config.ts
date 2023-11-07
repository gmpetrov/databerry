import { AgentModelName } from '@chaindesk/prisma';

const config = {
  defaultDatasourceChunkSize: 256,
  datasourceTable: {
    limit: 20,
  },
};

export const XPBNPLabels = {
  qa: 'Question/Réponse sur documents',
  writing: 'Rédaction',
  summary: "Résumé d'un document",
};

export const ModelConfig = {
  [AgentModelName.gpt_3_5_turbo]: {
    name: 'gpt-3.5-turbo-1106',
    maxTokens: 4096,
    cost: 1,
  },
  [AgentModelName.gpt_3_5_turbo_16k]: {
    name: 'gpt-3.5-turbo-1106',
    maxTokens: 16384,
    cost: 1,
  },
  [AgentModelName.gpt_4]: {
    name: 'gpt-4',
    maxTokens: 8192,
    cost: 30,
  },
  [AgentModelName.gpt_4_32k]: {
    name: 'gpt-4-32k',
    maxTokens: 32768,
    cost: 60,
  },
  [AgentModelName.gpt_4_turbo]: {
    name: 'gpt-4-1106-preview',
    maxTokens: 128000,
    cost: 13,
  },
  [AgentModelName.gpt_4_turbo_vision]: {
    name: 'gpt-4-vision-preview',
    maxTokens: 128000,
    cost: 13,
  },
};

export const appUrl = 'https://app.chaindesk.ai';
export const apiUrl = 'https://api.chaindesk.ai';

export default config;
