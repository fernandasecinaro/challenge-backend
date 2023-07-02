import { RegisterUserRequest } from 'models/requests/register/RegisterUserRequest';
import { RegisteredUser } from 'models/responses/users/RegisteredUser';

export interface IUsersService {
  registerUser(requestData: RegisterUserRequest): Promise<RegisteredUser>;
}
