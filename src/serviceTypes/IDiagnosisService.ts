import { Request } from 'express';
import { DiagnosisResponse } from 'models/responses/diagnosis/Diagnosis';

export default interface IDiagnosisService {
  getDiagnosis(req: Request): Promise<DiagnosisResponse[]>;
}
