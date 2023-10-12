const integrations = {
  crisp: () => import('./crisp'),
  slack: () => import('./slack'),
  notion: () => import('./notion'),
  zendesk: () => import('./zendesk'),
  'google-drive': () => import('./google-drive'),
};

export default integrations;
