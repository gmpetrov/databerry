import { generateNanoId } from '@chaindesk/lib/uuidv4';

import adjectives from './adjectives';

export default function generateFunId(nb = 6) {
  // pick a random adjective
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animals = adjectives[Math.floor(Math.random() * adjectives.length)];

  return `${adjective}-${animals}-${generateNanoId(nb)}`;
}
