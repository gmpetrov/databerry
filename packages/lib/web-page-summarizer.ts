import { blake3 } from 'hash-wasm';

export const generateId = async (url: string) => {
  const { host, pathname } = new URL(url);
  const _pathname = pathname.replace(/\/$/, '') || '/';

  const unhashed = `${host}${_pathname}`;
  const hash = await blake3(unhashed, 64); // 16 characters
  return hash;
};

export const parseId = (slug: string) => {
  return slug.slice(-16);
};
