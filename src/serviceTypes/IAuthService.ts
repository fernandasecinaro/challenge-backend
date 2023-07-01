import { Role, User } from '@prisma/client';
import { InvitePayload } from 'models/InvitePayload';
import { LoginRequest } from 'models/requests/auth/LoginRequest';

export default interface IAuthService {
  createInviteToken(user: User, email: string, role: Role, token?: string): Promise<string>;
  verifyInviteToken(token: string): Promise<InvitePayload>;
  login(requestData: LoginRequest): Promise<string>;
  refreshApiKey(familyId: number): Promise<string>;
  getApiKey(familyId: number): Promise<string>;
}
