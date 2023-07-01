import { z } from 'zod';

export const UpdateIncomeRequestSchema = z.object({
  params: z.object({
    incomeId: z.preprocess((arg) => {
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

export type UpdateIncomeRequest = z.infer<typeof UpdateIncomeRequestSchema>;
