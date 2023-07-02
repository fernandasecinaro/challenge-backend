import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { IUsersService } from 'serviceTypes/IUsersService';
import { RegisterUserRequest } from 'models/requests/register/RegisterUserRequest';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { InvalidDataError } from 'errors/InvalidDataError';
import { RegisteredUser } from 'models/responses/users/RegisteredUser';

@injectable()
class UsersService implements IUsersService {
  public constructor(@inject(REPOSITORY_SYMBOLS.IUsersRepository) private usersRepository: IUsersRepository) {}

  public async registerUser(requestData: RegisterUserRequest): Promise<RegisteredUser> {
    const { body } = requestData;
    const { fullName, email, password, dateOfBirth, gender } = body;

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await this.checkUserIsNotAlreadyRegistered(email);

    return await this.usersRepository.createUser({
      email,
      fullName,
      password: hashedPassword,
      dateOfBirth: new Date(dateOfBirth),
      gender,
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
