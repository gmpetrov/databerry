import Crisp from 'crisp-api';

const client = new Crisp();

client.authenticateTier(
  'plugin',
  process.env.CRISP_TOKEN_ID!,
  process.env.CRISP_TOKEN_KEY!
);

export const getConnectedWebsites = async () => {
  const sites = (await client.plugin.listAllConnectWebsites(1, false)) as any[];

  const connected: Record<string, { token: string }> = {};
  for (const each of sites) {
    connected[each.website_id] = {
      token: each.token,
    };
  }

  console.log('WEBSITES', connected);

  return connected;
};

export { client };
