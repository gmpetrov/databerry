import { Resolver } from '@parcel/plugin';
import path from 'path';
const __dirname = path.resolve(path.dirname(''));
// eslint-disable-next-line import/no-anonymous-default-export
export default new Resolver({
  async resolve({ specifier }) {
    if (specifier === 'process') {
      console.log('shimming process..');
      return {
        filePath: path.join(__dirname, '/parcel-resolver/shims/process.js'),
      };
    }
    if (specifier === 'buffer') {
      console.log('shimming process..');
      return {
        filePath: path.join(__dirname, '/parcel-resolver/shims/buffer.js'),
      };
    }
    if (specifier === 'next/router') {
      console.log('🚨 shimming next/router...');
      return {
        filePath: path.join(__dirname, '/parcel-resolver/shims/router.js'),
      };
    }

    return null;
  },
});
