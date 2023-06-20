const baseApiUrl = process.env.API_URL
  ? process.env.API_URL
  : 'https://api.databerry.ai';

module.exports = {
  type: 'custom',
  test: {
    headers: { Authorization: 'Bearer {{bundle.authData.api_key}}' },
    removeMissingValuesFrom: { params: true },
    url: `${baseApiUrl}/api/external/me`,
  },
  connectionLabel: (z, bundle) => {
    const { email } = bundle.inputData;
    return `User: ${email}`;
  },
  fields: [
    {
      computed: false,
      key: 'api_key',
      required: false,
      label: 'Databerry API Key',
      type: 'password',
      helpText:
        'Your Databerry API Key can be found here https://app.databerry.ai/account',
    },
  ],
  customConfig: {},
};
