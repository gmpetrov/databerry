import { AgentModelName } from '@prisma/client';

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
    name: 'gpt-3.5-turbo',
    maxTokens: 4096,
  },
  [AgentModelName.gpt_3_5_turbo_16k]: {
    name: 'gpt-3.5-turbo-16k',
    maxTokens: 16384,
  },
  [AgentModelName.gpt_4]: {
    name: 'gpt-4',
    maxTokens: 8192,
  },
  [AgentModelName.gpt_4_32k]: {
    name: 'gpt-4-32k',
    maxTokens: 32768,
  },
};

export default config;
