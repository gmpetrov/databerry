import { Buffer } from 'buffer';
import process from 'process';

import { generateFactory, injectFactoryInWindow } from './factory';

const ChaindeskFactory = generateFactory();
injectFactoryInWindow(ChaindeskFactory);

export default ChaindeskFactory;
