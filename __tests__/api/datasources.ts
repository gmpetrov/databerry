import axios, { AxiosError } from 'axios';

import { UpsertDatasourceSchema } from '@app/types/models';
import prisma from '@app/utils/prisma-client';
import sleep from '@app/utils/sleep';

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
  headers: {
    Authorization: `Bearer ${process.env.TEST_USER_API_KEY}`,
  },
});

beforeAll(async () => {});

describe('Datasources - Create', () => {
  it('should be forbidden without API Key', async () => {
    expect.assertions(1);
    try {
      await http.post(
        `/api/datasources`,
        {},
        {
          headers: {
            Authorization: ``,
          },
        }
      );
    } catch (err: any) {
      expect(err.response?.status).toBe(403);
    }
  });

  it('should create a web_page datasource', async () => {
    expect.assertions(2);
    try {
      const result = await http.post('/api/datasources', {
        datastoreId: process.env.TEST_DATASTORE_ID,
        name: 'Chaindesk Landingpage',
        type: 'web_page',
        config: {
          source_url: 'https://www.chaindesk.ai/',
        },
      } as UpsertDatasourceSchema);

      expect(!!result.data?.id).toBe(true);

      // wait 1 seconds for the worker to finish processing the datasource
      await sleep(1000);

      const { data } = await http.get(`/api/datasources/${result.data?.id}`);

      expect(data?.status).toBe('synched');

      await prisma.appDatasource.delete({
        where: {
          id: result?.data?.id,
        },
      });
    } catch (err: any) {
      console.log(err);

      // fail('Should be able to create a datasource');
    }
  });
});
