import { z } from 'zod';

export const CreateIncomeRequestSchema = z.object({
  body: z.object({
    amount: z.number().min(0),
    date: z.preprocess((arg) => {
      if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
    }, z.date()),
    categoryId: z.number().min(1),
    description: z.string(),
  }),
});

export type CreateIncomeRequest = z.infer<typeof CreateIncomeRequestSchema>;
