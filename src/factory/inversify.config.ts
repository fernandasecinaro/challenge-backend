import { Container } from 'inversify';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';
import { IUsersService } from 'serviceTypes/IUsersService';
import UsersRepository from 'repository/usersRepository';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import IAuthService from 'serviceTypes/IAuthService';
import MsUsersService from 'services/MSUsersService';

const myContainer = new Container();
myContainer.bind<IUsersRepository>(REPOSITORY_SYMBOLS.IUsersRepository).to(UsersRepository);

myContainer.bind<IUsersService>(SERVICE_SYMBOLS.IUsersService).to(MsUsersService);
myContainer.bind<IAuthService>(SERVICE_SYMBOLS.IAuthService).to(MsAuthService);

export default myContainer;
