import '../../styles/globals.css';
import '../../styles/preflight.css';

import {
  generateFactory,
  injectFactoryInWindow,
} from './chaindesk-web-factory';

const ChaindeskFactory = generateFactory();

injectFactoryInWindow(ChaindeskFactory);

export default ChaindeskFactory;
