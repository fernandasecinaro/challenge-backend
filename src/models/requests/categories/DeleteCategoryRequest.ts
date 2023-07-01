import { z } from 'zod';

export const DeleteCategoryRequestSchema = z.object({
  params: z.object({
    categoryId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
});

export type DeleteCategoryRequest = z.infer<typeof DeleteCategoryRequestSchema>;
