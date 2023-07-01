import { z } from 'zod';

import myContainer from 'factory/inversify.config';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IFamilyRepository } from 'repositoryTypes/IFamilyRepository';

const familyRepository = myContainer.get<IFamilyRepository>(REPOSITORY_SYMBOLS.IFamilyRepository);

// const familyNameIsUnique = async (familyName: string) => {
//   const family = await familyRepository.findByFamilyName(familyName);
//   return !family;
// };

export const RegisterAdminRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Not a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    familyName: z.string().min(1, 'Family Name is required'),
  }),
});

export type RegisterAdminRequest = z.infer<typeof RegisterAdminRequestSchema>;
