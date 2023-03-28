import { Prisma, PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const datastoreSelect = {
  id: true,
  type: true,
  name: true,
  config: true,
  ownerId: true,
  visibility: true,
  description: true,
  updatedAt: true,
  createdAt: true,
} as Prisma.DatastoreSelect;

export const datasourceSelect = {
  id: true,
  type: true,
  name: true,
  config: true,
  hash: true,
  datastoreId: true,
  lastSynch: true,
  nbChunks: true,
  ownerId: true,
  status: true,
  textSize: true,
  nbSynch: true,
  updatedAt: true,
  createdAt: true,
} as Prisma.AppDatasourceSelect;

export default prisma;
