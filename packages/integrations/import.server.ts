const handlers = {
  crisp: import('./crisp/api'),
  slack: import('./slack/api'),
  notion: import('./notion/api'),
  zendesk: import('./zendesk/api'),
  whatsapp: import('./whatsapp/api'),
  'google-drive': import('./google-drive/api'),
};

export default handlers;
