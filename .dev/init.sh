#!/bin/bash

cd /app/workspace

yarn global add pnpm && pnpm i
pnpm prisma:migrate:dev

# run server + worker
pnpm dev:all

echo "###### READY TO ROCK !"
sleep infinity
