import { z } from 'zod';

export const GetExpensesPerCategoryRequestSchema = z.object({
  query: z.object({
    from: z
      .preprocess((arg) => {
        if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
      }, z.date())
      .optional(),
    to: z
      .preprocess((arg) => {
        if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
      }, z.date())
      .optional(),
  }),
});

export type GetExpensesPerCategoryRequest = z.infer<typeof GetExpensesPerCategoryRequestSchema>;
