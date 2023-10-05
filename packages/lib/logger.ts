import '@axiomhq/pino';
import 'pino-pretty';

import pino from 'pino';

const transport: Parameters<typeof pino>['0']['transport'] = {
  target: 'pino-pretty',
  options: {
    colorize: true,
  },
};

// if (process.env.AXIOM_TOKEN) {
//   transport = {
//     target: '@axiomhq/pino',
//     options: {
//       dataset: process.env.AXIOM_DATASET,
//       token: process.env.AXIOM_TOKEN,
//     },
//   };
// }

const logger = pino({
  // transport,
});

export default logger;
