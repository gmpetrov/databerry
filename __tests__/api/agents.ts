import { testHttp } from '@app/utils/tests';

describe('Agents - Query', () => {
  // it('It should be unauthorized', async () => {
  //   const { data } = await testHttp
  //     .post(`/api/agents/${process.env.TEST_PRIVATE_AGENT}/query`, {
  //       query: 'Hello',
  //     })
  //     .then((data) => {
  //       fail('should be unauthorized');
  //       return data;
  //     })
  //     .catch((err) => {
  //       expect(err?.status).toBe(403);

  //       return err;
  //     });
  // });

  it('It should query agent', async () => {
    const { data } = await testHttp.post(
      `/api/agents/${process.env.TEST_PRIVATE_AGENT_ID}/query`,
      {
        query: 'Hello',
      }
    );

    expect(data?.answer).toBeDefined();
    expect(data?.conversationId).toBeDefined();
    expect(data?.sources).toBeDefined();
    expect(data?.visitorId).toBeDefined();
  });

  it('It should be same conversation ID', async () => {
    const { data } = await testHttp.post(
      `/api/agents/${process.env.TEST_PRIVATE_AGENT_ID}/query`,
      {
        query: 'Hello',
        conversationId: process.env.TEST_CONVERSATION_ID,
      }
    );

    expect(data?.conversationId).toBe(process.env.TEST_CONVERSATION_ID);
  });

  it('It should be same conversation ID', async () => {
    const { data } = await testHttp.post(
      `/api/agents/${process.env.TEST_PRIVATE_AGENT_ID}/query`,
      {
        query: 'Hello',
        conversationId: process.env.TEST_CONVERSATION_ID,
      }
    );

    expect(data?.conversationId).toBe(process.env.TEST_CONVERSATION_ID);
  });

  it('It should use filters', async () => {
    const { data } = await testHttp.post(
      `/api/agents/${process.env.TEST_PRIVATE_AGENT_ID}/query`,
      {
        query: 'Hello',
        filters: {
          datasource_ids: ['4242'],
        },
      }
    );

    expect(data?.answer).toBeDefined();
  });
});
