import { z } from 'zod';

export const NewSubscriptionRequestSchema = z.object({
  body: z.object({
    categoryId: z.number().min(1),
  }),
});

export type NewSubscriptionRequest = z.infer<typeof NewSubscriptionRequestSchema>;
