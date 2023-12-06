import Stripe from 'stripe';

import {
  AnalyticsEvents,
  capture,
  profile,
} from '@chaindesk/lib/analytics-server';
import { createApiHandler } from '@chaindesk/lib/createa-api-handler';
import { stripe } from '@chaindesk/lib/stripe-client';
import {
  PriceType,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

export const timestampToDate = (t?: number) => {
  if (!t) {
    return null;
  }
  return new Date(t * 1000);
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

const handler = createApiHandler();

handler.post(async (req, res) => {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    req.logger.error(`❌ Error message: ${(err as any)?.message}`);
    return res.status(400).send(`Webhook Error: ${(err as any)?.message}`);
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated': {
          const data = event.data.object as Stripe.Product;
          await prisma.product.upsert({
            where: {
              id: data.id,
            },
            update: {
              name: data.name,
              description: data.description,
              active: data.active,
              metadata: data.metadata,
            },
            create: {
              id: data.id,
              name: data.name,
              description: data.description,
              active: data.active,
              metadata: data.metadata,
            },
          });
          break;
        }
        case 'price.created':
        case 'price.updated': {
          const data = event.data.object as Stripe.Price;
          await prisma.price.upsert({
            where: {
              id: data.id,
            },
            update: {
              active: data.active,
              currency: data.currency,
              type: data.type as PriceType,
              unitAmount: data.unit_amount,
              interval: data.recurring?.interval,
              interval_count: data.recurring?.interval_count,
              trial_period_days: data.recurring?.trial_period_days,
            },
            create: {
              id: data.id,
              active: data.active,
              currency: data.currency,
              type: data.type as PriceType,
              unitAmount: data.unit_amount,
              interval: data.recurring?.interval,
              interval_count: data.recurring?.interval_count,
              trial_period_days: data.recurring?.trial_period_days,
              product: {
                connect: {
                  id: data.product as string,
                },
              },
            },
          });
          break;
        }
        case 'customer.subscription.deleted': {
          const data = event.data.object as Stripe.Subscription;

          const deleted = await prisma.subscription.update({
            where: {
              id: data.id,
            },
            data: {
              status: 'canceled',
              ended_at: timestampToDate(data.ended_at!),
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

          profile?.({
            userId: deleted?.organization?.memberships[0]?.userId!,
            plan: SubscriptionPlan.level_0,
          });

          break;
        }
        case 'customer.subscription.updated': {
          const data = event.data.object as Stripe.Subscription;

          const product = await stripe.products.retrieve(
            (data as any)?.plan?.product as string
          );

          const plan = product?.metadata?.plan as SubscriptionPlan;

          const current = await prisma.subscription.findUnique({
            where: {
              id: data.id,
            },
          });

          if (!current) {
            return;
          }

          const updated = await prisma.subscription.update({
            where: {
              id: data.id,
            },
            data: {
              price: {
                connect: {
                  id: data.items.data[0].price.id,
                },
              },
              plan: plan,
              status: data.status as any,
              metadata: data.metadata,
              cancel_at_period_end: data.cancel_at_period_end,
              canceled_at: timestampToDate(data.canceled_at!),
              cancel_at: timestampToDate(data.cancel_at!),
              start_date: timestampToDate(data.start_date!),
              ended_at: timestampToDate(data.ended_at!),
              trial_start: timestampToDate(data.trial_start!),
              trial_end: timestampToDate(data.trial_end!),
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

          const userId = updated?.organization?.memberships[0]?.userId!;
          const hasCanceled = !!updated.canceled_at && !current?.canceled_at;
          const hasRenewed = !updated.canceled_at && !!current?.canceled_at;

          if (current?.plan !== updated?.plan) {
            capture?.({
              event: AnalyticsEvents.USER_SWITCHED_PLAN,
              payload: {
                userId: userId,
                organizationId: updated?.organizationId,
                from: current?.plan,
                to: updated?.plan,
              },
            });
            profile?.({
              userId: userId,
              plan: updated?.plan,
            });
          }

          if (hasCanceled) {
            capture?.({
              event: AnalyticsEvents.USER_UNSUBSCRIBED,
              payload: {
                userId: userId,
                organizationId: updated?.organizationId,
                cancellationDetails: JSON.stringify(
                  data.cancellation_details || '{}'
                ),
              },
            });
          }

          if (hasRenewed) {
            capture?.({
              event: AnalyticsEvents.USER_RENEWED_PLAN,
              payload: {
                userId: userId,
                organizationId: updated?.organizationId,
              },
            });
          }

          break;
        }
        case 'checkout.session.completed':
          {
            const data = event.data.object as Stripe.Checkout.Session;
            const organizationId = data.client_reference_id as string;

            if (!organizationId) {
              throw new Error('No user id found');
            }

            const subscription = await stripe.subscriptions.retrieve(
              data.subscription as string,
              {
                expand: ['default_payment_method'],
              }
            );

            const product = await stripe.products.retrieve(
              (subscription as any)?.plan?.product as string
            );

            const plan = product?.metadata?.plan as SubscriptionPlan;

            const couponName = subscription?.discount?.coupon?.name;

            const created = await prisma.subscription.upsert({
              where: {
                id: subscription.id,
              },
              create: {
                id: subscription.id,
                customerId: subscription.customer as string,
                // ...(projectId
                //   ? {
                //       project: {
                //         connect: {
                //           id: projectId,
                //         },
                //       },
                //     }
                //   : {}),
                organization: {
                  connect: {
                    id: organizationId,
                  },
                },
                price: {
                  connect: {
                    id: subscription.items.data[0].price.id,
                  },
                },
                plan: plan,
                coupon: couponName,
                status: subscription.status as SubscriptionStatus,
                metadata: subscription.metadata,
                cancel_at_period_end: subscription.cancel_at_period_end,
                canceled_at: timestampToDate(subscription.canceled_at!),
                cancel_at: timestampToDate(subscription.cancel_at!),
                start_date: timestampToDate(subscription.start_date!),
                ended_at: timestampToDate(subscription.ended_at!),
                trial_start: timestampToDate(subscription.trial_start!),
                trial_end: timestampToDate(subscription.trial_end!),
              },
              update: {
                plan: plan,
                coupon: couponName,
                status: subscription.status as SubscriptionStatus,
                metadata: subscription.metadata,
                // ...(projectId
                //   ? {
                //       project: {
                //         connect: {
                //           id: projectId,
                //         },
                //       },
                //     }
                //   : {}),
                price: {
                  connect: {
                    id: subscription.items.data[0].price.id,
                  },
                },
                cancel_at_period_end: subscription.cancel_at_period_end,
                canceled_at: timestampToDate(subscription.canceled_at!),
                cancel_at: timestampToDate(subscription.cancel_at!),
                start_date: timestampToDate(subscription.start_date!),
                ended_at: timestampToDate(subscription.ended_at!),
                trial_start: timestampToDate(subscription.trial_start!),
                trial_end: timestampToDate(subscription.trial_end!),
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

            capture?.({
              event: AnalyticsEvents.USER_SUBSCRIBED,
              payload: {
                userId: created?.organization?.memberships[0]?.userId!,
                organizationId: created?.organizationId,
                plan,
              },
            });
            profile?.({
              userId: created?.organization?.memberships[0]?.userId!,
              plan,
            });
          }

          break;
        default:
          throw new Error(`Unhandled relevant event! ${event.type}`);
      }
    } catch (error) {
      req.logger.error(error);
      return res
        .status(400)
        .send('Webhook error: "Webhook handler failed. View logs."');
    }
  }

  res.json({ received: true });
});

export default handler;
