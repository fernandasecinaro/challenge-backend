import * as dotenv from 'dotenv';
import myContainer from './factory/inversify.config';
import { SERVICE_SYMBOLS } from './serviceTypes/serviceSymbols';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import UsersController from 'controllers/UsersController';
import { IUsersService } from 'serviceTypes/IUsersService';
import IAuthService from 'serviceTypes/IAuthService';
import AuthController from 'controllers/AuthController';
import ISymptomsService from 'serviceTypes/ISymptomsService';
import SymptomsController from 'controllers/SymptomsController';
import IDiagnosisService from 'serviceTypes/IDiagnosisService';
import DiagnosesController from 'controllers/DiagnosesController';

dotenv.config();

const PORT: number = parseInt(process.env.PORT ?? ('3000' as string), 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const usersService = myContainer.get<IUsersService>(SERVICE_SYMBOLS.IUsersService);
const usersController = new UsersController(usersService);

const authService = myContainer.get<IAuthService>(SERVICE_SYMBOLS.IAuthService);
const authController = new AuthController(authService);

const symptomsService = myContainer.get<ISymptomsService>(SERVICE_SYMBOLS.ISymptomsService);
const symptomsController = new SymptomsController(symptomsService);

const diagnosisService = myContainer.get<IDiagnosisService>(SERVICE_SYMBOLS.IDiagnosisService);
const diagnosisController = new DiagnosesController(diagnosisService);

app.use('/api/v1', usersController.usersRouter);
app.use('/api/v1', authController.authRouter);
app.use('/api/v1', symptomsController.symptomsRouter);
app.use('/api/v1', diagnosisController.diagnosisRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
