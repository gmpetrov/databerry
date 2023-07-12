import { AgentModelName } from '@prisma/client';

const config = {
  datasourceTable: {
    limit: 20,
  },
};

export const XPBNPLabels = {
  qa: 'Question/Réponse sur documents',
  writing: 'Rédaction',
  summary: "Résumé d'un document",
};

export const ModelNameConfig = {
  [AgentModelName.gpt_3_5_turbo]: 'gpt-3.5-turbo',
  [AgentModelName.gpt_4]: 'gpt-4',
};

export default config;
