const authentication = require('./authentication');
const listAgentsTrigger = require('./triggers/list_agents.js');
const listDatastoresTrigger = require('./triggers/list_datastores.js');
const queryAgentCreate = require('./creates/query_agent.js');
const queryDatastoreSearch = require('./searches/query_datastore.js');
const datastoreFileUpload = require('./creates/datastore_file_upload.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  searches: {
    [queryDatastoreSearch.key]: queryDatastoreSearch,
  },
  creates: {
    [queryAgentCreate.key]: queryAgentCreate,
    [datastoreFileUpload.key]: datastoreFileUpload,
  },
  triggers: {
    [listAgentsTrigger.key]: listAgentsTrigger,
    [listDatastoresTrigger.key]: listDatastoresTrigger,
  },
};
