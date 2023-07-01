import { z } from 'zod';

export const GetExpensesOfCategoryRequestSchema = z.object({
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
    skip: z
      .preprocess((arg) => {
        if (typeof arg == 'string') return parseInt(arg);
      }, z.number())
      .optional(),
    take: z
      .preprocess((arg) => {
        if (typeof arg == 'string') return parseInt(arg);
      }, z.number())
      .optional(),
  }),
  params: z.object({
    categoryId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
});

export type GetExpensesOfCategoryRequest = z.infer<typeof GetExpensesOfCategoryRequestSchema>;
