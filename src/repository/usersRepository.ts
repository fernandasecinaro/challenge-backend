import client from 'models/client';
import { User } from '@prisma/client';
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
      include: {
        subscriptions: true,
      },
    });
  }
  public async createUser(userData: User): Promise<User> {
    await client.$queryRaw`
    INSERT INTO User (email, password, id, createdAt, updatedAt, familyId, role, name)
    VALUES (${userData.email}, ${userData.password}, ${userData.id}, ${userData.createdAt}, ${userData.updatedAt}, ${userData.familyId}, ${userData.role}, ${userData.name})
    `;
    return (await this.getUserById(userData.id)) as User;
  }

  public async getUserById(id: number): Promise<User | null> {
    return await client.user.findUnique({
      where: {
        id,
      },
      include: {
        subscriptions: true,
      },
    });
  }
}

export default UsersRepository;
