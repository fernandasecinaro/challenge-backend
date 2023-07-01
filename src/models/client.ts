import { PrismaClient } from '@prisma/client';

// interface CustomNodeJsGlobal extends NodeJSGlobal
declare const global: Global & {
  prisma: PrismaClient;
};

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

const CATEGORY_MODEL_NAME = 'Category';
const EXPENSE_MODEL_NAME = 'Expense';
const INCOME_MODEL_NAME = 'Income';

// Middlewares for soft delete

prisma.$use(async (params, next) => {
  params = params ?? { args: {} };
  params.args = params.args ?? {};
  const isModelWithSoftDelete = [CATEGORY_MODEL_NAME, EXPENSE_MODEL_NAME, INCOME_MODEL_NAME].includes(
    params.model ?? '',
  );

  if (isModelWithSoftDelete) {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // Change to findFirst - you cannot filter
      // by anything except ID / unique with findUnique
      params.action = 'findFirst';
      // Add 'deleted' filter
      // ID filter maintained
      params.args.where['deleted'] = null;
    }
    if (params.action === 'findMany') {
      // Find many queries
      if (params?.args?.where) {
        if (params.args.where.deleted == undefined) {
          // Exclude deleted records if they have not been explicitly requested
          params.args.where['deleted'] = null;
        }
      } else {
        params.args['where'] = { deleted: null };
      }
    }
  }
  return next(params);
});

prisma.$use(async (params, next) => {
  params = params ?? { args: {} };
  params.args = params.args ?? {};

  const isModelWithSoftDelete = [CATEGORY_MODEL_NAME, EXPENSE_MODEL_NAME, INCOME_MODEL_NAME].includes(
    params.model ?? '',
  );

  if (isModelWithSoftDelete) {
    if (params.action == 'update') {
      console.info(`Update query on ${params.model}:`);
      console.info(JSON.stringify(params.args, null, 2));
      // Change to updateMany - you cannot filter
      // by anything except ID / unique with findUnique
      params.action = 'updateMany';
      // Add 'deleted' filter
      // ID filter maintained
      params.args.where['deleted'] = null;
    }
    if (params.action == 'updateMany') {
      console.info(`Update query on ${params.model}:`);
      console.info(JSON.stringify(params.args, null, 2));
      if (params?.args?.where != undefined) {
        params.args.where['deleted'] = null;
      } else {
        params.args['where'] = { deleted: null };
      }
    }
  }
  return next(params);
});

prisma.$use(async (params, next) => {
  // Check incoming query type
  params = params ?? { args: {} };
  params.args = params.args ?? {};
  const isModelWithSoftDelete = [CATEGORY_MODEL_NAME, EXPENSE_MODEL_NAME, INCOME_MODEL_NAME].includes(
    params.model ?? '',
  );
  if (isModelWithSoftDelete) {
    if (params.action == 'delete') {
      console.info(`Delete query on ${params.model}:`);
      console.info(JSON.stringify(params.args, null, 2));
      // Delete queries
      // Change action to an update
      params.action = 'update';
      params.args['data'] = { deleted: new Date() };
    }
    if (params.action == 'deleteMany') {
      console.info(`Delete query on ${params.model}:`);
      console.info(JSON.stringify(params.args, null, 2));
      // Delete many queries
      params.action = 'updateMany';
      if (params?.args?.data != undefined) {
        params.args.data['deleted'] = true;
      } else {
        params.args['data'] = { deleted: new Date() };
      }
    }
  }
  return next(params);
});

// Log create queries
prisma.$use(async (params, next) => {
  params = params ?? {};
  params.args = params.args ?? {};
  const isModelWithSoftDelete = [CATEGORY_MODEL_NAME, EXPENSE_MODEL_NAME, INCOME_MODEL_NAME].includes(
    params.model ?? '',
  );
  if (isModelWithSoftDelete) {
    if (params.action == 'create' || params.action == 'createMany') {
      console.info(`Create query on ${params.model}:`);
      console.info(JSON.stringify(params.args, null, 2));
    }
  }
  return next(params);
});

export default prisma;
