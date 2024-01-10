import { ChaindeskFactory } from './types';

declare global {
  interface Window {
    ChaindeskFactory: ChaindeskFactory;
    onMarkedAsResolved?(): any;
  }
}
