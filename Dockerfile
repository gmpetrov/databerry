# FROM node:18-alpine AS base

FROM ubuntu:focal as base
ARG SCOPE
ENV SCOPE=${SCOPE}
RUN set -uex; \
    apt-get update; \
    apt-get install -y ca-certificates curl gnupg; \
    mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
    NODE_MAJOR=18; \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list; \
    apt-get update; \
    apt-get install nodejs -y;
RUN npm --global install pnpm

# https://fly.io/docs/app-guides/supercronic/
# Latest releases available at https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.1/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=d7f4c0886eb85249ad05ed592902fa6865bb9d70

RUN curl -fsSLO "$SUPERCRONIC_URL" \
    && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
    && chmod +x "$SUPERCRONIC" \
    && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
    && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic


FROM base AS pruner
RUN npm --global install turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=${SCOPE} --docker

# Install dependencies only when needed
# FROM base AS deps

# # Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# # RUN apk add --no-cache libc6-compat

# WORKDIR /app

# # Install dependencies based on the preferred package manager
# COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD 1
# RUN \
#     if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#     elif [ -f package-lock.json ]; then npm ci; \
#     elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i ; \
#     else echo "Lockfile not found." && exit 1; \
#     fi
# RUN npx playwright install --with-deps chromium

# RUN rm -rf node_modules/.pnpm/canvas@2.11.2

# Rebuild the source code only when needed
FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD 1
WORKDIR /app
COPY .gitignore .gitignore
COPY .npmrc ./
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install
RUN pnpx playwright install --with-deps chromium
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
ARG NEXT_PUBLIC_DASHBOARD_URL
ARG NEXT_PUBLIC_SLACK_CLIENT_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LEVEL_1
ARG NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID
ARG NEXT_PUBLIC_CRISP_PLUGIN_ID
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_HOTJAR_ID

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


# COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/server ./server
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

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