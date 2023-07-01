import { z } from 'zod';

export const GetCategoriesRequestSchema = z.object({
  query: z.object({
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
});

export type GetCategoriesRequest = z.infer<typeof GetCategoriesRequestSchema>;
