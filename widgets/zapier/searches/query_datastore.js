const zapier = require('zapier-platform-core');

zapier.tools.env.inject();

const baseApiUrl = process.env.API_URL
  ? process.env.API_URL
  : 'https://api.chaindesk.ai';

module.exports = {
  display: {
    description: 'Query one of your datastore (semantic search)',
    hidden: false,
    label: 'Query Datastore',
  },
  key: 'query_datastore',
  noun: 'Datastore',

  operation: {
    inputFields: [
      {
        key: 'datastore_id',
        label: 'Datastore ID',
        type: 'string',
        helpText: 'The ID of the Datastore to query',
        dynamic: 'list_datastores.id.name',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'query',
        label: 'Query',
        type: 'string',
        helpText: 'The query to use to search a Datastore',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: {
      body: { query: '{{bundle.inputData.query}}' },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer {{bundle.authData.api_key}}',
      },
      method: 'POST',
      removeMissingValuesFrom: { params: true },
      url: `${baseApiUrl}/datastores/query/{{bundle.inputData.datastore_id}}`,
    },
    sample: {
      text: 'Lorem ipsum',
      source: 'https://www.chaindesk.ai/',
      score: 0.42,
    },
  },
};
