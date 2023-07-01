import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Role, User } from '@prisma/client';
import IAuthService from 'serviceTypes/IAuthService';
import { Optional } from 'helpers/Optional';
import { InvitePayload } from 'models/InvitePayload';
import { LoginRequest } from 'models/requests/auth/LoginRequest';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { InvalidDataError } from 'errors/InvalidDataError';
import { IFamilyRepository } from 'repositoryTypes/IFamilyRepository';
import 'reflect-metadata';

interface IDecodedToken {
  user: User;
}

@injectable()
export default class AuthService implements IAuthService {
  private secret = process.env.JWT_SECRET;

  public constructor(
    @inject(REPOSITORY_SYMBOLS.IUsersRepository) private usersRepository: IUsersRepository,
    @inject(REPOSITORY_SYMBOLS.IFamilyRepository) private familyRepository: IFamilyRepository,
  ) {}

  public async getApiKey(familyId: number): Promise<string> {
    const family = await this.familyRepository.findById(familyId);

    return family.apiKey;
  }

  public async refreshApiKey(familyId: number): Promise<string> {
    const newApiKey = await this.generateApiKey();

    await this.familyRepository.updateFamily(familyId, {
      apiKey: newApiKey,
    });

    return newApiKey;
  }

  private async generateApiKey(): Promise<string> {
    const apiKey = uuidv4();

    return `family-costs-${apiKey}`;
  }

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

  private async encryptTokenWithCrypto(token: string): Promise<string> {
    if (!this.secret) throw new Error('JWT_SECRET not set');

    const key = crypto.createHash('sha256').update(this.secret);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key.digest(), iv);
    let encrypted = cipher.update(token);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private async decryptTokenWithCrypto(token: string): Promise<string> {
    if (!this.secret) throw new Error('JWT_SECRET not set');

    const textParts = token.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');

    const key = crypto.createHash('sha256').update(this.secret);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key.digest(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  public async verifyInviteToken(token: string): Promise<InvitePayload> {
    if (!this.secret) throw new Error('JWT_SECRET not set');

    const decryptedToken = await this.decryptTokenWithCrypto(token);

    const decodedToken = jwt.verify(decryptedToken, this.secret) as InvitePayload;

    return decodedToken;
  }

  public async createInviteToken(user: User, email: string, role: Role): Promise<string> {
    const payload: InvitePayload = {
      familyId: user.familyId,
      email,
      role,
    };

    if (!this.secret) throw new Error('JWT_SECRET not set');

    const token = jwt.sign(JSON.stringify(payload), this.secret);
    const encryptedToken = await this.encryptTokenWithCrypto(token);

    return encryptedToken;
  }

  public async createToken(user: User): Promise<string> {
    if (!this.secret) throw new Error('JWT_SECRET not set');

    delete (user as Optional<User, 'password'>).password;

    const token = jwt.sign(JSON.stringify({ user }), this.secret);

    return token;
  }

  public async verifyToken(token: string): Promise<User> {
    if (!this.secret) throw new Error('JWT_SECRET not set');

    const decodedToken = jwt.verify(token, this.secret) as IDecodedToken;

    return decodedToken.user;
  }
}
