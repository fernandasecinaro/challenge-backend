import { injectable } from 'inversify';
import { Role, User } from '@prisma/client';
import IAuthService from 'serviceTypes/IAuthService';
import { InvitePayload } from 'models/InvitePayload';
import { LoginRequest } from 'models/requests/auth/LoginRequest';
import { InvalidDataError } from 'errors/InvalidDataError';
import 'reflect-metadata';
import axios from 'axios';

@injectable()
export default class MsAuthService implements IAuthService {
  private authServiceUrl = process.env.AUTH_SERVICE_URL;
  private axiosInstance = axios.create({
    baseURL: this.authServiceUrl,
  });

  public async getApiKey(familyId: number): Promise<string> {
    const { data } = await this.axiosInstance.get(`/families/${familyId}/api-keys`);
    return data.apiKey;
  }

  public async refreshApiKey(familyId: number): Promise<string> {
    const { data } = await this.axiosInstance.post(`/families/${familyId}/api-keys`);
    return data.apiKey;
  }

  public async login(requestData: LoginRequest): Promise<string> {
    const { body } = requestData;
    const { email, password } = body;

    try {
      const { data } = await this.axiosInstance.post('/login', {
        email,
        password,
      });

      return data.token;
    } catch (_error: any) {
      console.error(_error.message);
      throw new InvalidDataError('Invalid email or password');
    }
  }

  public async verifyInviteToken(token: string): Promise<InvitePayload> {
    const { data } = await this.axiosInstance.get('/invites', {
      params: {
        token,
      },
    });

    return data;
  }

  public async createInviteToken(user: User, email: string, role: Role, token: string): Promise<string> {
    const payload: InvitePayload = {
      familyId: user.familyId,
      email,
      role,
    };

    const { data } = await this.axiosInstance.post('/invites', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data.token;
  }
}
