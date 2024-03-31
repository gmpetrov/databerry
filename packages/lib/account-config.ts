import { AgentModelName, SubscriptionPlan } from '@chaindesk/prisma';

type Plan = {
  type: SubscriptionPlan;
  label: string;
  description: string;
  price: {
    usd: {
      monthly: number;
      annually: number;
      symbol: string;
    };
  };
  limits: {
    maxAgents: number;
    maxAgentsQueries: number;
    maxDatastores: number;
    maxDatasources: number;
    maxFileSize: number; // in bytes
    maxDataProcessing: number; // in bytes
    maxStoredTokens: number;

    maxSeats: number;

    // e.g.: Crisp / Slack thread summary
    maxSummary: number;

    maxWebsiteURL: number;
  };
};

const config: {
  [key in SubscriptionPlan]: Plan;
} = {
  [SubscriptionPlan.level_0]: {
    type: SubscriptionPlan.level_0,
    label: 'Free',
    description: 'The essentials to get started quickly.',
    price: {
      usd: {
        monthly: 0,
        annually: 0,
        symbol: '$',
      },
    },
    limits: {
      maxAgents: 1,
      maxAgentsQueries: 100,
      maxDatastores: 1,
      maxDatasources: 10, // per datastore
      maxFileSize: 1000000, // 1 MB
      maxDataProcessing: 5000000, // 5 MB
      maxSummary: 10,
      maxWebsiteURL: 25,
      maxSeats: 1,
      maxStoredTokens: 20000,
    },
  },
  [SubscriptionPlan.level_0_5]: {
    type: SubscriptionPlan.level_0_5,
    label: 'Hobby',
    description: 'A plan that scales with your rapidly growing business.',
    price: {
      usd: {
        monthly: 25,
        annually: 250,
        symbol: '$',
      },
    },
    limits: {
      maxAgents: 2,
      maxAgentsQueries: 2500,
      maxDatastores: 2,
      maxDatasources: 100, // per datastore
      maxFileSize: 5000000, // 5 MB
      maxDataProcessing: 25000000, // 50 MB
      maxSummary: 100,
      maxWebsiteURL: 150,
      maxSeats: 5,
      maxStoredTokens: 15000000,
    },
  },
  [SubscriptionPlan.level_1]: {
    type: SubscriptionPlan.level_1,
    label: 'Growth',
    description: 'A plan that scales with your rapidly growing business.',

    price: {
      usd: {
        monthly: 25,
        annually: 250,
        symbol: '$',
      },
    },
    limits: {
      maxAgents: 2,
      maxAgentsQueries: 5000,
      maxDatastores: 2,
      maxDatasources: 100, // per datastore
      maxFileSize: 5000000, // 5 MB
      maxDataProcessing: 50000000, // 50 MB
      maxSummary: 100,
      maxWebsiteURL: 250,
      maxSeats: 10,
      maxStoredTokens: 30000000,
    },
  },

  [SubscriptionPlan.level_2]: {
    type: SubscriptionPlan.level_2,
    label: 'Pro',
    description: 'For power users who want access more powerful features.',
    price: {
      usd: {
        monthly: 99,
        annually: 990,
        symbol: '$',
      },
    },
    limits: {
      maxAgents: 5,
      maxAgentsQueries: 10000,
      maxDatastores: 10,
      maxDatasources: 500, // per datastore
      maxFileSize: 10000000, // 10 MB
      maxDataProcessing: 100000000, // 100 MB
      maxSummary: 200,
      maxWebsiteURL: 1000,
      maxSeats: 25,
      maxStoredTokens: 60000000,
    },
  },
  [SubscriptionPlan.level_3]: {
    type: SubscriptionPlan.level_3,
    label: 'Enterprise',
    description: 'Dedicated support and for your team.',
    price: {
      usd: {
        monthly: 499,
        annually: 4990,
        symbol: '$',
      },
    },
    limits: {
      maxAgents: 100,
      maxAgentsQueries: 100000,
      maxDatastores: 100,
      maxDatasources: 500,
      maxFileSize: 50000000,
      maxDataProcessing: 500000000,
      maxSummary: 500,
      maxWebsiteURL: 10000,
      maxSeats: 200,
      maxStoredTokens: 300000000,
    },
  },
  [SubscriptionPlan.level_4]: {
    type: SubscriptionPlan.level_4,
    label: 'Ultimate',
    description: 'Dedicated support and for your team.',
    price: {
      usd: {
        monthly: 999,
        annually: 9990,
        symbol: '$',
      },
    },
    limits: {
      maxAgents: 200,
      maxAgentsQueries: 200000,
      maxDatastores: 200,
      maxDatasources: 1000,
      maxFileSize: 90000000,
      maxDataProcessing: 500000000,
      maxSummary: 500,
      maxWebsiteURL: 20000,
      maxSeats: 500,
      maxStoredTokens: 600000000,
    },
  },
};

export default config;
