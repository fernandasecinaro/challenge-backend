import { z } from 'zod';

export const UpdateCategoryRequestSchema = z.object({
  params: z.object({
    categoryId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    monthlySpendingLimit: z.number().min(0).optional(),
  }),
});

export type DeleteCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;
