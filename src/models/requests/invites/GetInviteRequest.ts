import { z } from 'zod';

export const GetInviteRequestSchema = z.object({
  query: z.object({
    token: z.string(),
  }),
});

export type GetInviteRequest = z.infer<typeof GetInviteRequestSchema>;
