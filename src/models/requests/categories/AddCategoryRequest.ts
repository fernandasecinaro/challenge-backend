import { z } from 'zod';

export const AddCategoryRequestSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    image: z.string().optional(),
    monthlySpendingLimit: z.number().min(0).optional(),
  }),
});

export type AddCategoryRequest = z.infer<typeof AddCategoryRequestSchema>;
