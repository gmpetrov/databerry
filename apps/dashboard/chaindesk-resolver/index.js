import { Resolver } from '@parcel/plugin';

// eslint-disable-next-line import/no-anonymous-default-export
export default new Resolver({
  async resolve({ specifier }) {
    if (specifier === 'process') {
      return { isExcluded: true };
    }
    if (specifier === 'buffer') {
      return { isExcluded: true };
    }
    return null;
  },
});
