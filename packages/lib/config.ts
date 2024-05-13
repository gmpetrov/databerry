import { AgentModelName, ConversationChannel } from '@chaindesk/prisma';

const config = {
  defaultDatasourceChunkSize: 1024,
  datasourceTable: {
    limit: 20,
  },
  demoBookingURL: 'https://calendar.app.google/C65KZcdgA9SBYQfBA',
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
    hasVision?: boolean;
    icon?: string;
  }
> = {
  [AgentModelName.gpt_3_5_turbo]: {
    name: 'gpt-3.5-turbo-0125',
    maxTokens: 16385,
    cost: 1,
    providerPriceByInputToken: 0.0000005,
    providerPricePriceByOutputToken: 0.0000015,
    isToolCallingSupported: true,
    icon: '/shared/images/logos/openai.svg',
  },
  [AgentModelName.gpt_3_5_turbo_16k]: {
    name: 'gpt-3.5-turbo-0125',
    maxTokens: 16385,
    cost: 1,
    providerPriceByInputToken: 0.0000005,
    providerPricePriceByOutputToken: 0.0000015,
    isToolCallingSupported: true,
    icon: '/shared/images/logos/openai.svg',
  },
  [AgentModelName.gpt_4]: {
    name: 'gpt-4',
    maxTokens: 8192,
    cost: 30,
    providerPriceByInputToken: 0.00003,
    providerPricePriceByOutputToken: 0.00006,
    isToolCallingSupported: true,
    icon: '/shared/images/logos/openai.svg',
  },
  [AgentModelName.gpt_4_32k]: {
    name: 'gpt-4-32k',
    maxTokens: 32768,
    cost: 60,
    providerPriceByInputToken: 0.00006,
    providerPricePriceByOutputToken: 0.00012,
    isToolCallingSupported: true,
    icon: '/shared/images/logos/openai.svg',
  },
  [AgentModelName.gpt_4_turbo]: {
    name: 'gpt-4-turbo',
    maxTokens: 128000,
    cost: 20,
    providerPriceByInputToken: 0.00001,
    providerPricePriceByOutputToken: 0.00003,
    isToolCallingSupported: true,
    icon: '/shared/images/logos/openai.svg',
    hasVision: true,
  },
  [AgentModelName.gpt_4_turbo_vision]: {
    name: 'gpt-4-turbo',
    maxTokens: 128000,
    cost: 20,
    providerPriceByInputToken: 0.00001,
    providerPricePriceByOutputToken: 0.00003,
    isToolCallingSupported: true,
    icon: '/shared/images/logos/openai.svg',
    hasVision: true,
  },
  [AgentModelName.gpt_4o]: {
    name: 'gpt-4o',
    maxTokens: 128000,
    cost: 10,
    providerPriceByInputToken: 0.000005,
    providerPricePriceByOutputToken: 0.000015,
    isToolCallingSupported: true,
    icon: '/shared/images/logos/openai.svg',
    hasVision: true,
  },
  [AgentModelName.claude_3_haiku]: {
    name: 'anthropic/claude-3-haiku:beta',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 200000,
    cost: 1,
    providerPriceByInputToken: 0.00000025,
    providerPricePriceByOutputToken: 0.00000125,
    isToolCallingSupported: false,
    icon: '/shared/images/logos/anthropic.svg',
    hasVision: true,
  },
  [AgentModelName.claude_3_sonnet]: {
    name: 'anthropic/claude-3-sonnet:beta',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 200000,
    cost: 8,
    providerPriceByInputToken: 0.000003,
    providerPricePriceByOutputToken: 0.000015,
    isToolCallingSupported: false,
    icon: '/shared/images/logos/anthropic.svg',
    hasVision: true,
  },
  [AgentModelName.claude_3_opus]: {
    name: 'anthropic/claude-3-opus:beta',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 200000,
    cost: 40,
    providerPriceByInputToken: 0.000015,
    providerPricePriceByOutputToken: 0.000075,
    isToolCallingSupported: false,
    icon: '/shared/images/logos/anthropic.svg',
    hasVision: true,
  },
  [AgentModelName.mixtral_8x7b]: {
    name: 'mistralai/mixtral-8x7b',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 32768,
    cost: 2,
    providerPriceByInputToken: 0.00000054,
    providerPricePriceByOutputToken: 0.00000054,
    isToolCallingSupported: false,
    icon: '/shared/images/logos/mistral.svg',
  },
  [AgentModelName.dolphin_mixtral_8x7b]: {
    name: 'cognitivecomputations/dolphin-mixtral-8x7b',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 32000,
    cost: 2,
    providerPriceByInputToken: 0.00000027,
    providerPricePriceByOutputToken: 0.00000027,
    isToolCallingSupported: false,
    icon: '/shared/images/logos/mistral.svg',
  },
  [AgentModelName.mixtral_8x22b]: {
    name: 'mistralai/mixtral-8x22b',
    baseUrl: 'https://openrouter.ai/api/v1',
    maxTokens: 65536,
    cost: 2,
    providerPriceByInputToken: 0.0000009,
    providerPricePriceByOutputToken: 0.0000009,
    isToolCallingSupported: false,
    icon: '/shared/images/logos/mistral.svg',
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
