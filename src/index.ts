import * as dotenv from 'dotenv';
import myContainer from './factory/inversify.config';
import { SERVICE_SYMBOLS } from './serviceTypes/serviceSymbols';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createTerminus } from '@godaddy/terminus';
import log4js from 'log4js';
import UsersController from 'controllers/UsersController';
import { IUsersService } from 'serviceTypes/IUsersService';
import IAuthService from 'serviceTypes/IAuthService';
import InvitesController from 'controllers/InvitesController';
import AuthController from 'controllers/AuthController';
import { IFamilyService } from 'serviceTypes/IFamilyService';
import { ICategoriesService } from 'serviceTypes/ICategoriesService';
import CategoryController from 'controllers/CategoryController';
import { IExpensesService } from 'serviceTypes/IExpensesService';
import ExpensesController from 'controllers/ExpensesController';

import 'models/redisClient';
import dbClient from 'models/client';
import client from 'models/redisClient';
import { IIncomesService } from 'serviceTypes/IIncomesService';
import IncomesController from 'controllers/IncomesController';
import { ISubscriptionsService } from 'serviceTypes/ISubscriptionsService';
import SubscriptionsController from 'controllers/SubscriptionsController';
import { Consumer } from 'sqs-consumer';
import { sqs } from 'sqs/SQS';
import { IBalancesService } from 'serviceTypes/IBalancesService';
import BalancesController from 'controllers/BalancesController';
import 'helpers/balanceProcessingQueue';
import 'helpers/categorySpendingLimitControlProcessingQueue';
import 'helpers/sagaQueueConsumer';

dotenv.config();

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: 'all' } },
});

const logger = log4js.getLogger('out');

console.log = (...args) => logger.info(...args);
console.info = (...args) => logger.info(...args);
console.error = (...args) => logger.error(...args);
console.warn = (...args) => logger.warn(...args);

const PORT: number = parseInt(process.env.PORT ?? ('3000' as string), 10);

const app = express();

app.use(
  morgan('tiny', {
    skip: (req, res) => res.statusCode >= 400,
    stream: {
      write: (msg: string) => {
        logger.info(msg);
      },
    },
  }),
);

app.use(
  morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: {
      write: (msg: string) => {
        logger.error(msg);
      },
    },
  }),
);

app.use(
  compression({
    level: 9,
  }),
);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err) {
    logger.error(err);
    res.status(500).send('Something broke!');
    return;
  }
  next();
});

const onSignal = () => {
  console.log('server is starting cleanup');
  return Promise.all([dbClient.$disconnect(), client.disconnect()]);
};

const onShutdown = () => {
  console.log('cleanup finished, server is shutting down');
  return Promise.resolve();
};

const healthCheck = async () => {
  try {
    const redisState = await client.ping();

    const dbState: [] =
      (await dbClient.$queryRaw`
      SELECT 1
    `) ?? [];

    if (redisState === 'PONG' && dbState.length > 0) {
      return {
        status: 'ok',
      };
    }

    return {
      status: 'error',
      details: {
        redis: redisState === 'PONG' ? 'ok' : 'error',
        db: dbState.length > 0 ? 'ok' : 'error',
      },
    };
  } catch (error: any) {
    return {
      status: 'error',
      details: {
        redis: 'error',
        db: 'error',
        error: error.message,
      },
    };
  }
};

const usersService = myContainer.get<IUsersService>(SERVICE_SYMBOLS.IUsersService);
const usersController = new UsersController(usersService);

const authService = myContainer.get<IAuthService>(SERVICE_SYMBOLS.IAuthService);
const authController = new AuthController(authService);

const familyService = myContainer.get<IFamilyService>(SERVICE_SYMBOLS.IFamilyService);
const invitesController = new InvitesController(usersService, authService, familyService);

const expensesService = myContainer.get<IExpensesService>(SERVICE_SYMBOLS.IExpensesService);
const expensesController = new ExpensesController(expensesService);

const incomesService = myContainer.get<IIncomesService>(SERVICE_SYMBOLS.IIncomesService);
const incomesController = new IncomesController(incomesService);

const categoriesService = myContainer.get<ICategoriesService>(SERVICE_SYMBOLS.ICategoriesService);
const categoriesController = new CategoryController(categoriesService);

const subscriptionsService = myContainer.get<ISubscriptionsService>(SERVICE_SYMBOLS.ISubscriptionsService);
const subscriptionsController = new SubscriptionsController(subscriptionsService);

const balancesService = myContainer.get<IBalancesService>(SERVICE_SYMBOLS.IBalancesService);
const balancesController = new BalancesController(balancesService);

app.use('/api/v1', usersController.usersRouter);
app.use('/api/v1', invitesController.invitesRouter);
app.use('/api/v1', authController.authRouter);
app.use('/api/v1', expensesController.expensesRouter);
app.use('/api/v1', incomesController.incomesRouter);
app.use('/api/v1', categoriesController.categoriesRouter);
app.use('/api/v1', subscriptionsController.subscriptionsRouter);
app.use('/api/v1', balancesController.balancesRouter);

app.use(function (req, res, next) {
  res.status(404);

  res.redirect('/');
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`);
});

const consumer = Consumer.create({
  queueUrl: process.env.SQS_TRANSACTION_QUEUE_URL,
  handleMessage: async (message) => {
    const { Body } = message;
    if (!Body) return;

    const { transactions } = JSON.parse(Body);
    transactions.forEach(async (transaction: any) => {
      const { userId, amount, type, description, categoryId, familyId } = transaction;

      const user = {
        id: userId,
        familyId,
      };
      const creationRequest = {
        body: {
          amount,
          date: new Date().toISOString(),
          description,
          categoryId,
        },
        user: user,
      };

      try {
        if (type === 'expense') {
          await expensesService.createExpense(creationRequest as any, user as any);
        } else if (type === 'income') {
          await incomesService.createIncome(creationRequest as any);
        }
      } catch (error) {
        console.error(error);
      }
    });

    console.log('Message received', message.Body);
  },
  sqs: sqs,
  pollingWaitTimeMs: 10000,
});

consumer.on('error', (err) => {
  console.log(err.message);
});

consumer.on('processing_error', (err) => {
  console.log(err.message);
});

consumer.start();

createTerminus(server, {
  healthChecks: {
    '/': healthCheck,
  },
  onSignal,
  onShutdown,
});
