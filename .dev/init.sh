#!/bin/bash

cd /home/node
echo "###### INITIALIZING PROJECT"

yarn global add pnpm@7 && \
pnpm config set store-dir /home/node/.local/share/pnpm/store && \
pnpm i 

pnpm prisma:migrate:dev

# run server + worker
pnpm dev:all

echo "###### READY TO ROCK !"
sleep infinity
