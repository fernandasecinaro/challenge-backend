import { z } from 'zod';

export const DeleteIncomeRequestSchema = z.object({
  params: z.object({
    incomeId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
});

export type DeleteExpenseRequest = z.infer<typeof DeleteIncomeRequestSchema>;
