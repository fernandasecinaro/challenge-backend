import { z } from 'zod';

export const GetIncomeRequestSchema = z.object({
  params: z.object({
    incomeId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
});

export type GetIncomeRequest = z.infer<typeof GetIncomeRequestSchema>;
