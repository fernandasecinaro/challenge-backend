import { RegisterUserRequest } from 'models/requests/register/RegisterUserRequest';

export interface IUsersService {
  registerUser(requestData: RegisterUserRequest): Promise<RegisteredUser>;
}
