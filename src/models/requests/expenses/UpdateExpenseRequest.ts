import { z } from 'zod';

export const UpdateExpenseRequestSchema = z.object({
  params: z.object({
    expenseId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
  body: z.object({
    amount: z.number().min(0).optional(),
    date: z
      .preprocess((arg) => {
        if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
      }, z.date())
      .optional(),
    categoryId: z.number().min(1).optional(),
    description: z.string().optional(),
  }),
});

export type UpdateExpenseRequest = z.infer<typeof UpdateExpenseRequestSchema>;
