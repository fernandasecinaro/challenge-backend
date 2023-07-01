import { z } from 'zod';

export const DeleteSubscriptionRequestSchema = z.object({
  query: z.object({
    categoryId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
});

export type DeleteSubscriptionRequest = z.infer<typeof DeleteSubscriptionRequestSchema>;
