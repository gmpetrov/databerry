import { AgentModelName, ConversationChannel } from '@chaindesk/prisma';

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

export const ModelConfig: Record<
  AgentModelName,
  {
    name: string;
    maxTokens: number;
    cost: number;
    providerPriceByInputToken: number;
    providerPricePriceByOutputToken: number;
    baseUrl?: string;
    isVisionSupported?: boolean;
    isToolCallingSupported?: boolean;
  }
> = {
  [AgentModelName.gpt_3_5_turbo]: {
    name: 'gpt-3.5-turbo-0125',
    maxTokens: 16385,
    cost: 1,
    providerPriceByInputToken: 0.0000005,
    providerPricePriceByOutputToken: 0.0000015,
    isToolCallingSupported: true,
  },
  [AgentModelName.gpt_3_5_turbo_16k]: {
    name: 'gpt-3.5-turbo-0125',
    maxTokens: 16385,
    cost: 1,
    providerPriceByInputToken: 0.0000005,
    providerPricePriceByOutputToken: 0.0000015,
    isToolCallingSupported: true,
  },
  [AgentModelName.gpt_4]: {
    name: 'gpt-4',
    maxTokens: 8192,
    cost: 30,
    providerPriceByInputToken: 0.00003,
    providerPricePriceByOutputToken: 0.00006,
    isToolCallingSupported: true,
  },
  [AgentModelName.gpt_4_32k]: {
    name: 'gpt-4-32k',
    maxTokens: 32768,
    cost: 60,
    providerPriceByInputToken: 0.00006,
    providerPricePriceByOutputToken: 0.00012,
    isToolCallingSupported: true,
  },
  [AgentModelName.gpt_4_turbo]: {
    name: 'gpt-4-0125-preview',
    maxTokens: 128000,
    cost: 13,
    providerPriceByInputToken: 0.00001,
    providerPricePriceByOutputToken: 0.00003,
    isToolCallingSupported: true,
  },
  [AgentModelName.gpt_4_turbo_vision]: {
    name: 'gpt-4-vision-preview',
    maxTokens: 128000,
    cost: 13,
    providerPriceByInputToken: 0.00001,
    providerPricePriceByOutputToken: 0.00003,
    isToolCallingSupported: true,
  },
  [AgentModelName.claude_3_haiku]: {
    name: 'anthropic/claude-3-haiku',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 200000,
    cost: 1,
    providerPriceByInputToken: 0.00000025,
    providerPricePriceByOutputToken: 0.00000125,
    isToolCallingSupported: false,
  },
  [AgentModelName.mixtral_8x7b]: {
    name: 'mistralai/mixtral-8x7b',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 32768,
    cost: 2,
    providerPriceByInputToken: 0.00000054,
    providerPricePriceByOutputToken: 0.00000054,
    isToolCallingSupported: false,
  },
  [AgentModelName.dolphin_mixtral_8x7b]: {
    name: 'cognitivecomputations/dolphin-mixtral-8x7b',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 32000,
    cost: 2,
    providerPriceByInputToken: 0.00000027,
    providerPricePriceByOutputToken: 0.00000027,
    isToolCallingSupported: false,
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

export const channelConfig = {
  [ConversationChannel.api]: {
    isMarkdownCompatible: true,
  },
  [ConversationChannel.crisp]: {
    isMarkdownCompatible: false,
  },
  [ConversationChannel.dashboard]: {
    isMarkdownCompatible: true,
  },
  [ConversationChannel.form]: {
    isMarkdownCompatible: true,
  },
  [ConversationChannel.mail]: {
    isMarkdownCompatible: false,
  },
  [ConversationChannel.slack]: {
    isMarkdownCompatible: false,
  },
  [ConversationChannel.website]: {
    isMarkdownCompatible: true,
  },
  [ConversationChannel.whatsapp]: {
    isMarkdownCompatible: false,
  },
  [ConversationChannel.zapier]: {
    isMarkdownCompatible: true,
  },
} as Record<
  ConversationChannel,
  {
    isMarkdownCompatible: boolean;
  }
>;

export default config;
