import * as dotenv from 'dotenv';
import myContainer from './factory/inversify.config';
import { SERVICE_SYMBOLS } from './serviceTypes/serviceSymbols';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import log4js from 'log4js';
import UsersController from 'controllers/UsersController';
import { IUsersService } from 'serviceTypes/IUsersService';
import IAuthService from 'serviceTypes/IAuthService';
import AuthController from 'controllers/AuthController';

import 'models/redisClient';
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

const usersService = myContainer.get<IUsersService>(SERVICE_SYMBOLS.IUsersService);
const usersController = new UsersController(usersService);

const authService = myContainer.get<IAuthService>(SERVICE_SYMBOLS.IAuthService);
const authController = new AuthController(authService);

app.use('/api/v1', usersController.usersRouter);
app.use('/api/v1', authController.authRouter);

app.use(function (_req, res, next) {
  res.status(404);

  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
