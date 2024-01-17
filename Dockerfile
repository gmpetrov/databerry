FROM node:18-alpine AS base
ARG SCOPE
ENV SCOPE=${SCOPE}


RUN npm --global install pnpm


FROM base AS pruner
RUN npm --global install turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=${SCOPE} --docker


# Rebuild the source code only when needed
FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
WORKDIR /app
COPY .gitignore .gitignore
COPY .npmrc ./
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install

RUN rm -rf node_modules/.pnpm/canvas@2.11.2

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
# RUN mv next.config.docker.js next.config.js
# RUN npm run prisma:generate

ARG NEXT_PUBLIC_S3_BUCKET_NAME
ARG NEXT_PUBLIC_AWS_ENDPOINT
ARG NEXT_PUBLIC_DASHBOARD_URL
ARG NEXT_PUBLIC_SLACK_CLIENT_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LEVEL_1
ARG NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID
ARG NEXT_PUBLIC_CRISP_PLUGIN_ID
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_HOTJAR_ID
ARG NEXT_PUBLIC_FATHOM_SITE_ID
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_MIXPANEL_TOKEN
ARG NEXT_PUBLIC_FACEBOOK_PIXEL_ID

# RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build

RUN NODE_OPTIONS="--max_old_space_size=4096" pnpm turbo run build --filter=${SCOPE}...

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


COPY --from=builder /app/apps/${SCOPE}/public ./apps/${SCOPE}/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/${SCOPE}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${SCOPE}/.next/static ./apps/${SCOPE}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${SCOPE}/.next/server ./apps/${SCOPE}/.next/server

# # Prisma
# COPY ./packages/prisma ./packages/prisma
# COPY --from=builder /app/node_modules/.pnpm/@prisma+client@5.3.1_prisma@5.3.1/node_modules/@prisma/client ./node_modules/@prisma/client
# COPY --from=builder /app/node_modules/.pnpm/@prisma+engines@5.3.1/node_modules/@prisma/engines ./node_modules/@prisma/engines
# COPY --from=builder /app/node_modules/.pnpm/prisma@5.3.1/node_modules/prisma ./node_modules/prisma
# COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
# RUN ./node_modules/.bin/prisma generate --schema=packages/prisma/schema.prisma;

USER nextjs

EXPOSE 3000

ENV PORT 3000

# CMD ["node", "server.js"]
CMD node apps/${SCOPE}/server.js