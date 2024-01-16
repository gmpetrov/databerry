import { MessageFrom } from '@prisma/client';
import { Prisma } from '@prisma/client';
import pMap from 'p-map';
import pRetry from 'p-retry';

import makeBatch from '@chaindesk/lib/make-batch';
import prisma from '@chaindesk/prisma/client';

(async () => {
  const count = await prisma.conversation.count();

  const take = 1000 as number;
  const nbPages = Math.ceil(count / take);

  console.log('number conversations to process', count);
  console.log(`nbpages: ${nbPages}, pageSize: ${take}`);

  console.time('TOTAL_TIME');

  for (let index = 1; index < nbPages; index++) {
    console.log(`⏳ page ${index + 1} / ${nbPages}`);

    const conversations = await prisma.conversation.findMany({
      include: {
        contacts: true,
        participants: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: take,
      skip: index * take,
    });

    const batch = makeBatch(conversations, 1);
    // const totalBatches = conversations.length;
    // console.log('number batches', totalBatches);

    let currentBatch = 0;
    // for (const b of batch) {

    // }
    console.time(`BATCH_${index}/${nbPages}`);

    await pMap(
      batch,
      async (b, index) => {
        console.log(`⏳ batch ${++currentBatch} / ${batch.length}`);

        await pRetry(
          async () => {
            await prisma.$transaction(
              b.map((each) => {
                const hasOneContactOnly = each.contacts?.length === 1;
                console.log('createdAt', each.createdAt);
                return prisma.conversation.update({
                  where: { id: each.id },
                  data: {
                    participantsUsers: {
                      connect: [
                        ...(each?.userId ? [{ id: each.userId }] : []),
                        ...(each?.participants?.map((p) => ({
                          id: p.id,
                        })) || []),
                      ],
                    },
                    participantsAgents: {
                      connect: [
                        ...(each?.agentId ? [{ id: each.agentId }] : []),
                      ],
                    },
                    participantsContacts: {
                      connect: [
                        ...(each?.contacts?.map((c) => ({ id: c.id })) || []),
                      ],
                    },
                    participantsVisitors: {
                      connectOrCreate: [
                        ...(!!each?.visitorId && !each?.userId
                          ? [
                              {
                                where: {
                                  id: each.visitorId!,
                                },
                                create: {
                                  id: each.visitorId!,
                                  organizationId: each.organizationId!,
                                  ...(hasOneContactOnly
                                    ? { contactId: each.contacts[0].id }
                                    : {}),
                                },
                              },
                            ]
                          : []),
                      ],
                    },
                    ...(each?.userId || each?.agentId
                      ? {
                          messages: {
                            updateMany: [
                              ...(each?.agentId
                                ? [
                                    {
                                      where: {
                                        from: MessageFrom.agent,
                                      },
                                      data: {
                                        agentId: each.agentId,
                                      },
                                    },
                                  ]
                                : []),
                              ...(each?.userId
                                ? [
                                    {
                                      where: {
                                        from: MessageFrom.human,
                                      },
                                      data: {
                                        userId: each.userId!,
                                      },
                                    },
                                  ]
                                : []),
                            ],
                          },
                        }
                      : {}),
                  },
                });
              })
            );
          },
          {
            retries: 1,
          }
        );

        // console.timeEnd(`TRANSACTION_${index}`);
      },
      {
        concurrency: 100,
      }
    );

    console.timeEnd(`BATCH_${index}/${nbPages}`);

    // await pMap(
    //   conversations,
    //   async (each, index) => {
    //     console.log(`⏳ batch ${index + 1} / ${totalBatches}`);

    //     let counter = 0;

    //     // await prisma.$transaction(updates);
    //     // await Promise.all(updates);

    //     console.log(`✅ batch ${index + 1} / ${totalBatches}`);
    //   },
    //   { concurrency: 10 }
    // );
  }

  console.log('✅ done');
  console.timeEnd('TOTAL_TIME');
})();
