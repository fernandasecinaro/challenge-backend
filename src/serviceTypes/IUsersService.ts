import { User } from '@prisma/client';
import { RegisterUserRequest } from 'models/requests/register/RegisterUserRequest';

export interface IUsersService {
  registerUser(requestData: RegisterUserRequest): Promise<User>;
}
