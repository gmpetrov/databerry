import { blake3 } from 'hash-wasm';

const createIntegrationId = async (props: {
  siteurl: string;
  organizationId: string;
}) => {
  const id = await blake3(`${props.organizationId}-${props.siteurl}`);

  return id;
};

export default createIntegrationId;
