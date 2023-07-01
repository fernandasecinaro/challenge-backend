import { z } from 'zod';

import myContainer from 'factory/inversify.config';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';

const usersRepository = myContainer.get<IUsersRepository>(REPOSITORY_SYMBOLS.IUsersRepository);

const userExists = async (email: string) => {
  const user = await usersRepository.getUserByEmail(email);
  return !!user;
};

export const LoginRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .refine(userExists, {
        message: 'Email or password is incorrect',
      }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
