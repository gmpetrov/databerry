const http = require('https'); // require('http') if your URL is not https

const FormData = require('form-data');

const zapier = require('zapier-platform-core');

zapier.tools.env.inject();

const baseApiUrl = process.env.API_URL
  ? process.env.API_URL
  : 'https://api.chaindesk.ai';

// Getting a stream directly from http. This only works on core 10+. For core
// 9.x compatible code, see uploadFile_v9.js.
const makeDownloadStream = (url) =>
  new Promise((resolve, reject) => {
    http
      .request(url, (res) => {
        // We can risk missing the first n bytes if we don't pause!
        res.pause();
        resolve(res);
      })
      .on('error', reject)
      .end();
  });

const perform = async (z, bundle) => {
  // bundle.inputData.file will in fact be an URL where the file data can be
  // downloaded from which we do via a stream
  const stream = await makeDownloadStream(bundle.inputData.file, z);

  const form = new FormData();
  form.append('file', stream);
  form.append('fileName', bundle.inputData.fileName || '');

  // All set! Resume the stream
  stream.resume();

  console.log('bundle.authData.api_key', bundle.authData);

  const response = await z.request({
    url: `${baseApiUrl}/api/external/datastores/file-upload/${bundle.inputData.datastore_id}`,
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${bundle.authData.api_key}`,
    },
  });

  return response.data;
};

module.exports = {
  key: 'datastore_file_upload',
  noun: 'File',
  display: {
    label: 'Upload File',
    description: 'Upload a new file to one of your Datastore.',
  },
  operation: {
    inputFields: [
      {
        key: 'datastore_id',
        label: 'Datastore ID',
        type: 'string',
        helpText: 'The ID of your Datastore',
        dynamic: 'list_datastores.id.name',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      { key: 'fileName', required: false, type: 'string', label: 'File Name' },
      { key: 'file', required: true, type: 'file', label: 'File' },
    ],
    perform,
    sample: {
      file: 'SAMPLE FILE',
      fileName: 'test.pdf',
    },
  },
};
