import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@prisma/client';
import IAuthService from 'serviceTypes/IAuthService';
import { Optional } from 'helpers/Optional';
import { LoginRequest } from 'models/requests/auth/LoginRequest';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { InvalidDataError } from 'errors/InvalidDataError';
import 'reflect-metadata';

interface IDecodedToken {
  user: User;
}

@injectable()
export default class AuthService implements IAuthService {
  private secret = process.env.JWT_SECRET;

  public constructor(@inject(REPOSITORY_SYMBOLS.IUsersRepository) private usersRepository: IUsersRepository) {}

  public async login(requestData: LoginRequest): Promise<string> {
    const { body } = requestData;
    const { email, password } = body;

    const user = await this.usersRepository.getUserByEmail(email);

    if (!user) throw new InvalidDataError('User not found');

    this.verifyPassword(password, user);

    const token = await this.createToken(user);

    return token;
  }

  private verifyPassword(password: string, user: User) {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const isPasswordCorrect = user.password === hashedPassword;

    if (!isPasswordCorrect) throw new InvalidDataError('Password is incorrect');
  }

  public async createToken(user: User): Promise<string> {
    if (!this.secret) throw new Error('JWT_SECRET not set');

    delete (user as Optional<User, 'password'>).password;

    const token = jwt.sign(JSON.stringify({ user }), this.secret);

    return token;
  }
}
