#!/bin/bash


cd /home/node
echo "###### INITIALIZING PROJECT"

pnpm i 

pnpm prisma:migrate:dev

# run server + worker
pnpm dev:all

echo "###### READY TO ROCK !"
sleep infinity
