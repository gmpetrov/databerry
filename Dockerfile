# FROM node:18-alpine AS base

FROM ubuntu:focal as base

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

# Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD 1
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i ; \
    else echo "Lockfile not found." && exit 1; \
    fi
RUN npx playwright install --with-deps chromium

RUN rm -rf node_modules/.pnpm/canvas@2.11.2

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
RUN mv next.config.docker.js next.config.js
RUN npm run prisma:generate

ARG NEXT_PUBLIC_S3_BUCKET_NAME
ARG NEXT_PUBLIC_DASHBOARD_URL
ARG NEXT_PUBLIC_SLACK_CLIENT_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LEVEL_1
ARG NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID
ARG NEXT_PUBLIC_CRISP_PLUGIN_ID
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_HOTJAR_ID

RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/server ./server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# # TODO: Improve this. Output file tracing is removing modules needed for workers
# COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# RUN yarn global add husky
# RUN \
#     if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#     elif [ -f package-lock.json ]; then npm ci; \
#     elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i ; \
#     else echo "Lockfile not found." && exit 1; \
#     fi
USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]