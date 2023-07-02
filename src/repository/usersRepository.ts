import client from 'models/client';
import { Prisma, User } from '@prisma/client';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';

@injectable()
class UsersRepository implements IUsersRepository {
  public async getUserByEmail(email: string): Promise<User | null> {
    return client.user.findUnique({
      where: {
        email,
      },
    });
  }

  public async createUser(userData: Prisma.UserCreateInput): Promise<User> {
    return await client.user.create({
      data: userData,
    });
  }

  public async getUserById(id: number): Promise<User | null> {
    return await client.user.findUnique({
      where: {
        id,
      },
    });
  }
}

export default UsersRepository;
