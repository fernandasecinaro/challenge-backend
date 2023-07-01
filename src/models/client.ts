import { PrismaClient } from '@prisma/client';

// interface CustomNodeJsGlobal extends NodeJSGlobal
declare const global: Global & {
  prisma: PrismaClient;
};

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
