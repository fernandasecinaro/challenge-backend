import { User } from '@prisma/client';
import { InviteUserRequest } from 'models/requests/invites/InviteUserRequest';
import { RegisterAdminRequest } from 'models/requests/register/RegisterAdminRequest';
import { RegisterRequest } from 'models/requests/register/RegisterRequest';

export interface IUsersService {
  registerAdmin(requestData: RegisterAdminRequest): Promise<void>;
  registerUser(requestData: RegisterRequest): Promise<void>;
  inviteUser(requestData: InviteUserRequest, user: User, bearerToken?: string): Promise<void>;
}
