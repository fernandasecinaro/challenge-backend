import { z } from 'zod';

export const RegisterUserRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Not a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(1, 'Full Name is required'),
  }),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;
