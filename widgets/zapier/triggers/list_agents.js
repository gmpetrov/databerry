const zapier = require('zapier-platform-core');

zapier.tools.env.inject();

const baseApiUrl = process.env.API_URL
  ? process.env.API_URL
  : 'https://api.chaindesk.ai';

module.exports = {
  operation: {
    perform: {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer {{bundle.authData.api_key}}',
      },
      url: `${baseApiUrl}/api/agents`,
    },
    sample: {
      id: process.env.TEST_AGENT_ID || 'cliobpozh0000e9og25x37w42',
      name: 'Test Agent',
      description: 'Test',
      prompt:
        "As a customer support agent, please provide a helpful and professional response to the user's question or issue.\nAnswer in 20 words maximum.",
      promptType: 'customer_support',
      iconUrl: null,
      temperature: 0,
      visibility: 'private',
      ownerId: 'clfqwsim10000mm08xzbdfy6p',
      nbQueries: 0,
      interfaceConfig: {},
      createdAt: '2023-06-09T08:46:30.847Z',
      updatedAt: '2023-06-09T08:49:01.150Z',
      owner: {
        id: 'clfqwsim10000mm08xzbdfy42',
        name: null,
        email: 'test@gmail.com',
        emailVerified: '2023-06-06T18:38:54.697Z',
        image: null,
        picture: null,
        hasOptInEmail: false,
        createdAt: '2023-03-27T14:12:59.833Z',
        updatedAt: '2023-06-06T18:38:54.698Z',
        subscriptions: [
          {
            id: 'sub_1MskKfIDmvRZDzsDi5FIFH42',
            plan: 'level_3',
            priceId: 'price_1MsMNMIDmvRZDzsDYJ4MLM42',
            customerId: 'cus_Ne2PRiawBvgl42',
            status: 'active',
            start_date: '2023-04-03T10:09:49.000Z',
            ended_at: null,
            trial_end: null,
            trial_start: null,
            cancel_at: null,
            cancel_at_period_end: false,
            canceled_at: null,
            metadata: {},
            coupon: null,
            userId: 'clfqwsim10000mm08xzbdfy42',
            createdAt: '2023-04-03T10:10:07.743Z',
            updatedAt: '2023-06-03T10:17:02.442Z',
          },
        ],
      },
      tools: [
        {
          id: 'cliobswym00l4pje913eids42',
          type: 'datastore',
          datastoreId: 'cli02efzi0000oge9xc6qhq42',
        },
      ],
    },
    outputFields: [
      { key: 'id', label: 'Agent ID', type: 'string' },
      { key: 'name', label: 'Agent Name', type: 'string' },
      { key: 'prompt', label: 'Agent Prompt', type: 'string' },
    ],
  },
  display: {
    description: 'Triggers when you want to list your agents.',
    hidden: true,
    label: 'Get Agents',
  },
  key: 'list_agents',
  noun: 'Agent',
};
