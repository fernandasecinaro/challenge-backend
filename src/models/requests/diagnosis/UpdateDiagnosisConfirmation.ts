import { z } from 'zod';

export const UpdateDiagnosisConfirmationRequestSchema = z.object({
  params: z.object({
    diagnosisId: z.preprocess((arg) => {
      if (typeof arg == 'string') return parseInt(arg);
    }, z.number()),
  }),
  body: z.object({
    confirmed: z.boolean(),
  }),
});

export type UpdateDiagnosisConfirmationRequest = z.infer<typeof UpdateDiagnosisConfirmationRequestSchema>;
