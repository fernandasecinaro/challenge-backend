import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Not a valid email'),
    password: z.string().min(8),
    name: z.string().min(1),
    invitationToken: z.string(),
  }),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
