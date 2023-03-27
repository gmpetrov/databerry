import { customAlphabet } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

export const generateNanoId = (length: number) => {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  return customAlphabet(alphabet, length)();
};

export default uuidv4;
