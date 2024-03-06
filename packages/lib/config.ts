import { AgentModelName } from '@chaindesk/prisma';

const config = {
  defaultDatasourceChunkSize: 1024,
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
    // name: 'gpt-3.5-turbo-1106',
    name: 'gpt-3.5-turbo-0125',
    maxTokens: 16385,
    cost: 1,
    providerPriceByInputToken: 0.0000005,
    providerPricePriceByOutputToken: 0.0000015,
  },
  [AgentModelName.gpt_3_5_turbo_16k]: {
    // name: 'gpt-3.5-turbo-1106',
    name: 'gpt-3.5-turbo-0125',
    maxTokens: 16385,
    cost: 1,
    providerPriceByInputToken: 0.0000005,
    providerPricePriceByOutputToken: 0.0000015,
  },
  [AgentModelName.gpt_4]: {
    name: 'gpt-4',
    maxTokens: 8192,
    cost: 30,
    providerPriceByInputToken: 0.00003,
    providerPricePriceByOutputToken: 0.00006,
  },
  [AgentModelName.gpt_4_32k]: {
    name: 'gpt-4-32k',
    maxTokens: 32768,
    cost: 60,
    providerPriceByInputToken: 0.00006,
    providerPricePriceByOutputToken: 0.00012,
  },
  [AgentModelName.gpt_4_turbo]: {
    name: 'gpt-4-0125-preview',
    maxTokens: 128000,
    cost: 13,
    providerPriceByInputToken: 0.00001,
    providerPricePriceByOutputToken: 0.00003,
  },
  [AgentModelName.gpt_4_turbo_vision]: {
    name: 'gpt-4-vision-preview',
    maxTokens: 128000,
    cost: 13,
    providerPriceByInputToken: 0.00001,
    providerPricePriceByOutputToken: 0.00003,
  },
};

export const appUrl = 'https://app.chaindesk.ai';
export const apiUrl = 'https://api.chaindesk.ai';
// export const appUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL as string;
// export const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

export const youtubeSummaryTool = {
  sitemapPageSize: 1000,
  paginationLimit: 100,
};

export default config;
