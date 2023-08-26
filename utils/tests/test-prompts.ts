import pMap from 'p-map';

import AgentManager from '@app/utils/agent';
import prisma from '@app/utils/prisma-client';

const customerSupportDataset = [
  {
    question: 'Qui est tu?',
  },
  {
    question: '¿eres mi amigo?',
  },
  {
    question: "C'est quoi chaindesk?",
  },
  {
    question: '什么是 chaindesk.ai？',
  },
  {
    question: 'Combien ca coute?',
  },
  {
    question: 'Comment créer un site internet?',
  },
  {
    question: "Est-il possible d'evaluer la réponse des agents?",
  },
];

(async () => {
  const agent = await prisma.agent.findUnique({
    where: {
      id: 'cljbv4k010001dg0ug9812757',
    },
    include: {
      tools: {
        include: {
          datastore: true,
        },
      },
    },
  });

  const manager = new AgentManager({
    agent: agent as any,
  });

  await pMap(
    customerSupportDataset,
    async ({ question }) => {
      const { answer } = await manager.query({
        input: question,
      });

      console.log(`---\n${question}: ${answer}\n`);
    },
    {
      concurrency: 1,
    }
  );
})();
