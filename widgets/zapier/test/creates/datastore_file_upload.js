require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

const CORE_VERSION = zapier.version.split('.').map((s) => parseInt(s));

const FILE_URL =
  'https://cdn.zapier.com/storage/files/f6679cf77afeaf6b8426de8d7b9642fc.pdf';

// This is what you get when doing `curl <FILE_URL> | sha1sum`
const EXPECTED_SHA1 = '3cf58b42a0fb1b7cc58de8110096841ece967530';

describe('uploadFile', () => {
  it('File Upload', async () => {
    if (CORE_VERSION[0] < 10) {
      console.warn(
        `skipped because this only works on core v10+ and you're on ${zapier.version}`
      );
      return;
    }

    const bundle = {
      authData: {
        api_key: process.env.API_KEY,
        oauth_consumer_key: process.env.OAUTH_CONSUMER_KEY,
        oauth_consumer_secret: process.env.OAUTH_CONSUMER_SECRET,
        oauth_token: process.env.OAUTH_TOKEN,
        oauth_token_secret: process.env.OAUTH_TOKEN_SECRET,
      },
      inputData: {
        datastore_id: process.env.TEST_DATASTORE_ID,
        file: FILE_URL,
        fileName: 'test.pdf',
      },
    };

    const result = await appTester(
      App.creates.datastore_file_upload.operation.perform,
      bundle
    );

    result.id.should.not.empty();
  });
});
