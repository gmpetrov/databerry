import prisma from '@chaindesk/prisma/client';
(async () => {
  const integrations = await prisma.serviceProvider.findMany({
    where: {
      organization: {
        is: null,
      },
    },
    include: {
      agents: true,
    },
  });

  let counter = 0;
  const idsToDelete = [] as string[];
  for (const each of integrations) {
    if (!each?.agents?.[0]) {
      console.log('no agent for integration', each);
      counter++;
      idsToDelete.push(each.id);
    } else {
      console.log(each);
      await prisma.serviceProvider.update({
        where: {
          id: each.id,
        },
        data: {
          organization: {
            connect: {
              id: each.agents[0].organizationId!,
            },
          },
        },
      });
    }
  }

  // if (idsToDelete.length) {
  //   await prisma.serviceProvider.deleteMany({
  //     where: {
  //       id: {
  //         in: idsToDelete,
  //       },
  //     },
  //   });
  // }

  console.log('nb integrations to patch', integrations.length);
  console.log('nb integrations without agent', counter);
})();
