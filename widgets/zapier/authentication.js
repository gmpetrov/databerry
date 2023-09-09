const baseApiUrl = process.env.API_URL
  ? process.env.API_URL
  : 'https://app.chaindesk.ai';

module.exports = {
  type: 'custom',
  test: {
    headers: { Authorization: 'Bearer {{bundle.authData.api_key}}' },
    removeMissingValuesFrom: { params: true },
    url: `${baseApiUrl}/api/me`,
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
      label: 'ChatbotGPT API Key',
      type: 'password',
      helpText:
        'Your ChatbotGPT API Key can be found here https://app.chaindesk.ai/account',
    },
  ],
  customConfig: {},
};
