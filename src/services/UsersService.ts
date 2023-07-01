import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { IUsersService } from 'serviceTypes/IUsersService';
import { RegisterUserRequest } from 'models/requests/register/RegisterUserRequest';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { User } from '@prisma/client';
import { SERVICE_SYMBOLS } from 'serviceTypes/serviceSymbols';
import IAuthService from 'serviceTypes/IAuthService';
import { InvalidDataError } from 'errors/InvalidDataError';

@injectable()
class UsersService implements IUsersService {
  public constructor(
    @inject(REPOSITORY_SYMBOLS.IUsersRepository) private usersRepository: IUsersRepository,
    @inject(SERVICE_SYMBOLS.IAuthService) private authService: IAuthService,
  ) {}

  public async registerUser(requestData: RegisterUserRequest): Promise<User> {
    const { body } = requestData;
    const { fullName, email, password } = body;

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await this.checkUserIsNotAlreadyRegistered(email);

    await this.usersRepository.createUser({
      email,
      fullName,
      password: hashedPassword,
    });
  }

  public async checkUserIsNotAlreadyRegistered(email: string): Promise<void> {
    const user = await this.usersRepository.getUserByEmail(email);

    if (user) {
      throw new InvalidDataError('User already exists');
    }
  }
}

export default UsersService;
