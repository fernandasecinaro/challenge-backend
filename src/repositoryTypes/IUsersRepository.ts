import { Prisma, User } from '@prisma/client';

export interface IUsersRepository {
  createUser(userData: Prisma.UserCreateInput): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;
}
