const handlers = {
  crisp: import('./crisp/api'),
  slack: import('./slack/api'),
  notion: import('./notion/api'),
  'google-drive': import('./google-drive/api'),
};

export default handlers;
