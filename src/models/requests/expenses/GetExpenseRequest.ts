import { z } from 'zod';

export const GetExpenseRequestSchema = z.object({
  params: z.object({
    expenseId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
});

export type GetExpenseRequest = z.infer<typeof GetExpenseRequestSchema>;
