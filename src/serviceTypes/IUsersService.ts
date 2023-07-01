import { User } from '@prisma/client';
import { RegisterRequest } from 'models/requests/register/RegisterRequest';

export interface IUsersService {
  registerUser(requestData: RegisterRequest): Promise<User>;
}
