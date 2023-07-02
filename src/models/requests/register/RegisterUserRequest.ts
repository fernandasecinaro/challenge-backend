import { z } from 'zod';

export const RegisterUserRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Not a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(3, 'Full Name must be at least 3 characters'),
    dateOfBirth: z.preprocess((arg) => {
      if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
    }, z.date()),
    gender: z.enum(['male', 'female', 'other']),
  }),
});

export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;
