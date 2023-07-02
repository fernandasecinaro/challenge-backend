import { Container } from 'inversify';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';
import { IUsersService } from 'serviceTypes/IUsersService';
import UsersRepository from 'repository/usersRepository';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import IAuthService from 'serviceTypes/IAuthService';
import UsersService from 'services/UsersService';
import AuthService from 'services/AuthService';
import ISymptomsService from 'serviceTypes/ISymptomsService';
import SymptomsService from 'services/SymptomsService';
import IDiagnosisService from 'serviceTypes/IDiagnosisService';
import DiagnosisService from 'services/DiagnosisService';

const myContainer = new Container();
myContainer.bind<IUsersRepository>(REPOSITORY_SYMBOLS.IUsersRepository).to(UsersRepository);

myContainer.bind<IUsersService>(SERVICE_SYMBOLS.IUsersService).to(UsersService);
myContainer.bind<IAuthService>(SERVICE_SYMBOLS.IAuthService).to(AuthService);
myContainer.bind<ISymptomsService>(SERVICE_SYMBOLS.ISymptomsService).to(SymptomsService);
myContainer.bind<IDiagnosisService>(SERVICE_SYMBOLS.IDiagnosisService).to(DiagnosisService);

export default myContainer;
