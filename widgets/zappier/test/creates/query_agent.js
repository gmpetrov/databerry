require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Create - query_agent', () => {
  zapier.tools.env.inject();

  it('should create an object', async () => {
    const bundle = {
      authData: {
        api_key: process.env.API_KEY,
        oauth_consumer_key: process.env.OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: process.env.OAUTH_CONSUMER_SECRET,
        oauth_token: process.env.OAUTH_TOKEN,
        oauth_token_secret: process.env.OAUTH_TOKEN_SECRET,
      },

      inputData: {
        agent_id: process.env.TEST_AGENT_ID,
        query: 'hello',
      },
    };

    const result = await appTester(
      App.creates['query_agent'].operation.perform,
      bundle
    );
    result.should.not.be.an.Array();
  });
});
