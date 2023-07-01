import { LoginRequest } from 'models/requests/auth/LoginRequest';

export default interface IAuthService {
  login(requestData: LoginRequest): Promise<string>;
}
