import { z } from 'zod';

export const DeleteExpenseRequestSchema = z.object({
  params: z.object({
    expenseId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
});

export type DeleteExpenseRequest = z.infer<typeof DeleteExpenseRequestSchema>;
