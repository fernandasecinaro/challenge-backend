import { z } from 'zod';

export const CreateExpenseRequestSchema = z.object({
  body: z.object({
    amount: z.number().min(0),
    date: z.preprocess((arg) => {
      if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
    }, z.date()),
    categoryId: z.number().min(1),
    description: z.string(),
  }),
});

export type CreateExpenseRequest = z.infer<typeof CreateExpenseRequestSchema>;
