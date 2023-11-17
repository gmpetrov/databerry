import axios from 'axios';
import Mixpanel from 'mixpanel';
import pMap from 'p-map';

import { AnalyticsEvents } from '@chaindesk/lib/analytics-server';
import prisma from '@chaindesk/prisma/client';

let mixpanel = undefined as Mixpanel.Mixpanel | undefined;

if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel = Mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    host: 'api-eu.mixpanel.com',
  });
}

(async () => {
  // console.log('mixpanel', mixpanel);
  // const users = await prisma.user.findMany();
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
    },
    include: {
      organization: {
        include: {
          memberships: {
            where: {
              role: 'OWNER',
            },
          },
        },
      },
    },
  });
  // const messages = await prisma.message.findMany({
  //   where: {
  //     from: 'agent',
  //     conversation: {
  //       user: {
  //         is: null,
  //       },
  //     },
  //   },
  //   include: {
  //     conversation: {
  //       include: {
  //         organization: {
  //           include: {
  //             memberships: {
  //               where: {
  //                 role: 'OWNER',
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  console.log('subscriptions', subscriptions.length);

  // console.log('users', users.length);

  // const chunks = [];

  // while (messages.length) {
  //   chunks.push(messages.splice(0, 2000));
  // }

  // console.log('chunks', chunks.length);

  // for (const chunk of chunks) {
  // const res = await axios.post(
  //   'https://api.mixpanel.com/engage?verbose=1#profile-batch-update',
  //   subscriptions.map((each) => ({
  //     $token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!,
  //     $distinct_id: each.id,
  //     $set: {
  //       plan: each.plan,
  //     },
  //   })),
  //   {}
  // );
  // for (const chunk of chunks) {
  const res = await axios
    .post(
      'https://api.mixpanel.com/import?strict=1&verbose=1&project_id=3146707',
      subscriptions.map((each) => ({
        event: AnalyticsEvents.USER_SUBSCRIBED,
        properties: {
          time: each.createdAt.getTime(),
          distinct_id: each?.organization?.memberships?.[0]?.userId,
          organizationId: each?.organizationId,
          $insert_id: each.id,
          plan: each.plan,
        },
        // $token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!,
        // $distinct_id: each.id,
        // $set: {
        //   plan: each.plan,
        // },
      })),
      {
        headers: {
          Authorization: `Basic XXX`,
        },
      }
    )
    .then((res) => res.data)
    .catch(console.log);
  // }

  // }
  console.log(res);

  console.log('done');
})();
