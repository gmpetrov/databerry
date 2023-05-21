#!/bin/bash

cd /app/workspace

yarn global add pnpm && pnpm i
pnpm prisma:migrate:dev

# Run server
pnpm dev

# Run worker process
pnpm worker:datasource-loader

echo "###### READY TO ROCK !"
sleep infinity
