import { generateFactory, injectFactoryInWindow } from './factory';

const ChaindeskFactory = generateFactory();
injectFactoryInWindow(ChaindeskFactory);

export default ChaindeskFactory;
