const zapier = require('zapier-platform-core');

zapier.tools.env.inject();

const baseApiUrl = process.env.API_URL
  ? process.env.API_URL
  : 'https://api.chaindesk.ai';

module.exports = {
  display: {
    description: 'Query one of your Agent',
    hidden: false,
    label: 'Query Agent',
  },
  key: 'query_agent',
  noun: 'Agent',
  operation: {
    inputFields: [
      {
        key: 'agent_id',
        label: 'Agent ID',
        type: 'string',
        helpText: 'The ID of your Agent',
        dynamic: 'list_agents.id.name',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'query',
        label: 'Query',
        type: 'string',
        helpText: 'The query to send to the Agent',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'truncateQuery',
        label: 'Truncate Query',
        type: 'boolean',
        helpText:
          "Automatically truncate the query to fit Agent'model context size limit",
        required: false,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: {
      body: {
        query: '{{bundle.inputData.query}}',
        truncateQuery: '{{bundle.inputData.truncateQuery}}',
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer {{bundle.authData.api_key}}',
      },
      method: 'POST',
      url: `${baseApiUrl}/api/agents/{{bundle.inputData.agent_id}}/query`,
    },
    sample: {
      query: 'Hello',
      answer:
        'Hello! How may I assist you today? Please let me know if you have any questions or concerns related to our services or policies. If you need more information about our chat site app, you can check out our documentation at https://docs.chaindesk.ai/apps/chat-site. Additionally, if you have any questions about our privacy policy, you can find it at https://www.chaindesk.ai/privacy. Please let me know if there is anything else I can help you with.',
    },
    outputFields: [{ key: 'answer', label: 'Answer', type: 'string' }],
  },
};
