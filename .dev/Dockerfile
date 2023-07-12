FROM node:18-bullseye

WORKDIR /home/node

USER root

# ENV PATH="/opt/node/.config/yarn/global/node_modules/.bin:${PATH}"

RUN npm install -g pnpm && \
    pnpm config set store-dir /home/node/node_modules/.pnpm-store && \
    mkdir -p node_modules/.pnpm && \
    mkdir -p node_modules/.pnpm-store

ENTRYPOINT []