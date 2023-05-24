FROM node:18-bullseye

ARG DBUSER
ARG DBPASS
ARG DBNAME

ENV DATABASE_URL=postgresql://${DBUSER}:${DBPASS}@pgdb14:5432/${DBNAME}
ENV REDIS_URL=redis://redis:6379

WORKDIR /app

USER node

ENV PATH="/home/node/.config/yarn/global/node_modules/.bin/:${PATH}"
ENTRYPOINT []