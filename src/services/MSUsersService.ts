import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IUsersService } from 'serviceTypes/IUsersService';
import { RegisterAdminRequest } from 'models/requests/register/RegisterAdminRequest';
import { InviteUserRequest } from 'models/requests/invites/InviteUserRequest';
import { User } from '@prisma/client';
import { SERVICE_SYMBOLS } from 'serviceTypes/serviceSymbols';
import IAuthService from 'serviceTypes/IAuthService';
import { IEmailService } from 'serviceTypes/IEmailService';
import { RegisterRequest } from 'models/requests/register/RegisterRequest';
import { InvalidDataError } from 'errors/InvalidDataError';
import axios, { AxiosError } from 'axios';

@injectable()
class MsUsersService implements IUsersService {
  private authServiceUrl = process.env.AUTH_SERVICE_URL;
  private axiosInstance = axios.create({
    baseURL: this.authServiceUrl,
  });
  public constructor(
    @inject(SERVICE_SYMBOLS.IAuthService) private authService: IAuthService,
    @inject(SERVICE_SYMBOLS.IEmailService) private emailService: IEmailService,
  ) {}

  public async registerUser(requestData: RegisterRequest): Promise<void> {
    const { body } = requestData;
    const { email, password, name, invitationToken } = body;

    const inviteToken = await this.authService.verifyInviteToken(invitationToken);
    const { role, familyId } = inviteToken;

    try {
      await this.axiosInstance.post('/users', {
        email,
        password,
        name,
        role,
        familyId,
      });
    } catch (error: any) {
      throw new InvalidDataError((error as AxiosError).message);
    }
  }

  public async inviteUser(requestData: InviteUserRequest, user: User, bearerToken: string): Promise<void> {
    const { body } = requestData;
    const { email, role } = body;

    const inviteToken = await this.authService.createInviteToken(user, email, role);

    await this.emailService.sendInviteEmail(email, inviteToken);
  }

  public async registerAdmin(requestData: RegisterAdminRequest): Promise<void> {
    const { body } = requestData;
    const { familyName, email, password, name } = body;

    try {
      await this.axiosInstance.post('/users', {
        email,
        password,
        name,
        familyName,
      });
    } catch (error: any) {
      throw new InvalidDataError(((error as AxiosError)?.response?.data as any).message ?? 'Invalid data');
    }
  }
}

export default MsUsersService;
