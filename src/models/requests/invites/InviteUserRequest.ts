import { z } from 'zod';

export const InviteUserRequestSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Not a valid email'),
    role: z.enum(['admin', 'user']),
  }),
});

export type InviteUserRequest = z.infer<typeof InviteUserRequestSchema>;
