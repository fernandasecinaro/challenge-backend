import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { IUsersService } from 'serviceTypes/IUsersService';
import { RegisterAdminRequest } from 'models/requests/register/RegisterAdminRequest';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { InviteUserRequest } from 'models/requests/invites/InviteUserRequest';
import { User } from '@prisma/client';
import { SERVICE_SYMBOLS } from 'serviceTypes/serviceSymbols';
import IAuthService from 'serviceTypes/IAuthService';
import { IEmailService } from 'serviceTypes/IEmailService';
import { RegisterRequest } from 'models/requests/register/RegisterRequest';
import { InvalidDataError } from 'errors/InvalidDataError';

@injectable()
class UsersService implements IUsersService {
  public constructor(
    @inject(REPOSITORY_SYMBOLS.IUsersRepository) private usersRepository: IUsersRepository,
    @inject(SERVICE_SYMBOLS.IAuthService) private authService: IAuthService,
    @inject(SERVICE_SYMBOLS.IEmailService) private emailService: IEmailService,
  ) {}

  public async registerUser(requestData: RegisterRequest): Promise<void> {
    const { body } = requestData;
    const { email, password, name, invitationToken } = body;

    const inviteToken = await this.authService.verifyInviteToken(invitationToken);
    await this.checkUserIsNotAlreadyRegistered(email);
    const { role, familyId } = inviteToken;

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // await this.usersRepository.createUser({
    //   email,
    //   name,
    //   password: hashedPassword,
    //   famil
    //   role,
    // });
  }

  public async inviteUser(requestData: InviteUserRequest, user: User): Promise<void> {
    const { body } = requestData;
    const { email, role } = body;

    const inviteToken = await this.authService.createInviteToken(user, email, role);

    await this.emailService.sendInviteEmail(email, inviteToken);
  }

  public async registerAdmin(requestData: RegisterAdminRequest): Promise<void> {
    const { body } = requestData;
    const { familyName, email, password, name } = body;

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    await this.checkUserIsNotAlreadyRegistered(email);

    // await this.usersRepository.createUser({
    //   email,
    //   name,
    //   password: hashedPassword,
    //   family: {
    //     connectOrCreate: {
    //       where: { name: familyName },
    //       create: { name: familyName, apiKey: `family-costs-${uuidv4()}` },
    //     },
    //   },
    //   role: 'admin',
    // });
  }

  public async checkUserIsNotAlreadyRegistered(email: string): Promise<void> {
    const user = await this.usersRepository.getUserByEmail(email);

    if (user) {
      throw new InvalidDataError('User already exists');
    }
  }
}

export default UsersService;
