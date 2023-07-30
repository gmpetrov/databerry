import axios, { AxiosError } from 'axios';

import { testHttp } from '@app/utils/tests';

describe('Datastores - Query', () => {
  it('It should query datastore', async () => {
    const res = await testHttp.post(
      `/api/datastores/query/${process.env.TEST_DATASTORE_ID}`,
      {
        query: 'Hello',
      }
    );

    expect(Array.isArray(res?.data)).toBe(true);
  });

  it('It should query datastore', async () => {
    const res = await testHttp.post(
      `/api/datastores/${process.env.TEST_DATASTORE_ID}/query`,
      {
        query: 'Hello',
      }
    );

    expect(Array.isArray(res?.data)).toBe(true);
  });

  it('Sould retrieve topK chunks', async () => {
    const res = await testHttp.post(
      `/api/datastores/${process.env.TEST_DATASTORE_ID}/query`,
      {
        query: 'Hello',
        topK: 2,
      }
    );

    expect(res?.data?.length).toBe(2);
  });
});
