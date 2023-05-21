FROM node:20-bullseye
ARG UID

WORKDIR /app

RUN useradd -u $UID -s /bin/bash -d /app databerry-user \
    && chown -R databerry-user: /app
USER databerry-user

ENTRYPOINT []