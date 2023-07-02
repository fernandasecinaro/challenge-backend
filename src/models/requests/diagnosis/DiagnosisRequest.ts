import { z } from 'zod';

export const GetDiagnosisRequestSchema = z.object({
  query: z.object({
    symptoms: z.string().refine(
      (val) => {
        try {
          const parsedArray = JSON.parse(val);
          return Array.isArray(parsedArray) && parsedArray.every((item) => typeof item === 'number');
        } catch (error) {
          return false;
        }
      },
      {
        message: 'Diagnosis should be a valid array of numbers',
      },
    ),
  }),
});

export type GetDiagnosisRequest = z.infer<typeof GetDiagnosisRequestSchema>;
