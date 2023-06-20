#!/bin/bash

cd /app/workspace

pwd
ls

yarn global add pnpm@7 && pnpm i

pnpm prisma:migrate:dev

# run server + worker
pnpm dev:all

echo "###### READY TO ROCK !"
sleep infinity
