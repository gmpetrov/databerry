import { blake3 } from 'hash-wasm';

const createIntegrationId = async (props: {
  siteurl: string;
  userId: string;
}) => {
  const id = await blake3(`${props.userId}-${props.siteurl}`);

  return id;
};

export default createIntegrationId;
