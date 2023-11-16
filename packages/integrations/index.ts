const integrations = {
  crisp: () => import('./crisp'),
  slack: () => import('./slack'),
  notion: () => import('./notion'),
  'google-drive': () => import('./google-drive'),
};

export default integrations;
