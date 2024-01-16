import prisma from '@chaindesk/prisma/client';

(async () => {
  const count = await prisma.agent.count({
    where: {
      form: {
        isNot: null,
      },
    },
  });

  console.log('number forms to process', count);
  const updated = await prisma.agent.updateMany({
    where: {
      form: {
        isNot: null,
      },
    },
    data: {
      restrictKnowledge: false,
      useMarkdown: false,
      useLanguageDetection: false,
    },
  });
  console.log(`✅ updated ${updated.count} agents`);
})();
