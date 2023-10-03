import Cors from 'cors';

import type { Middleware } from './pipe';

const cors = (options: Cors.CorsOptions): Middleware => {
  const _cors = Cors(options);

  return (req, res) => {
    return new Promise((resolve, reject) => {
      _cors(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  };
};

export default cors;
