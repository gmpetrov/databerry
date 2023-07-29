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
      removeMissingValuesFrom: { params: true },
      url: `${baseApiUrl}/api/datastores`,
    },
    outputFields: [
      { key: 'id', label: 'Datastore ID', type: 'string' },
      { key: 'name', label: 'Datastore Name', type: 'string' },
      { key: 'description', label: 'Datastore Description', type: 'string' },
    ],
    sample: {
      id: process.env.TEST_AGENT_ID || 'cliobpozh0000e9og25x37w42',
      name: 'Test Datastore',
      description: 'Test description',
    },
  },
  display: {
    description: 'Triggers when you want to list your datastores.',
    hidden: true,
    label: 'Get Datastores',
  },
  key: 'list_datastores',
  noun: 'Datastore',
};
