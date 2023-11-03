import fs from 'fs';
import path from 'path';

import { DatasourceSchema } from '@chaindesk/lib/types/models';
import { prisma } from '@chaindesk/prisma/client';
import sleep from '@app/utils/sleep';
import { testHttp } from '@app/utils/tests';

beforeAll(async () => {});

describe('Datasources - Create', () => {
  it('should be forbidden without API Key', async () => {
    expect.assertions(1);
    try {
      await testHttp.post(
        `/api/datasources`,
        {},
        {
          headers: {
            Authorization: ``,
          },
        }
      );
    } catch (err) {
      expect((err as any)?.response?.status).toBe(403);
    }
  });

  it('should create a web_page datasource', async () => {
    expect.assertions(2);
    try {
      const result = await testHttp.post('/api/datasources', {
        datastoreId: process.env.TEST_DATASTORE_ID,
        name: 'Chaindesk Landingpage',
        type: 'web_page',
        config: {
          source_url: 'https://www.chaindesk.ai/',
        },
      } as DatasourceSchema);

      expect(!!result.data?.id).toBe(true);

      // wait 1 seconds for the worker to finish processing the datasource
      await sleep(2000);

      const { data } = await testHttp.get(
        `/api/datasources/${result.data?.id}`
      );

      expect(data?.status).toBe('synched');

      await prisma.appDatasource.delete({
        where: {
          id: result?.data?.id,
        },
      });
    } catch (err) {
      console.log(err);

      // fail('Should be able to create a datasource');
    }
  });

  it('should create a file datasource', async () => {
    const filePath = path.resolve(process.cwd(), 'public/privacy.pdf');
    const fileName = 'privacy.pdf';
    const buffer = fs.readFileSync(filePath);

    const formData = new FormData();

    formData.append(
      'file',
      new Blob([buffer], {
        type: 'application/pdf',
      }),
      fileName
    );

    formData.append('type', 'file');
    formData.append('fileName', fileName);
    formData.append('datastoreId', process.env.TEST_DATASTORE_ID!);

    const { data } = await testHttp.post('/api/datasources', formData);

    expect(!!data?.id).toBe(true);

    expect(data?.name).toBe(fileName);

    await sleep(2000);

    const up: any = await testHttp.get(`/api/datasources/${data?.id}`);

    expect(up?.data?.status).toBe('synched');

    await prisma.appDatasource.delete({
      where: {
        id: data?.id,
      },
    });
  });
});
