import { Request } from 'express';
import { Diagnosis, DiagnosisConfirmation, DiagnosisHistory } from 'models/responses/diagnosis/Diagnosis';

export default interface IDiagnosisService {
  getDiagnosis(req: Request): Promise<Diagnosis[]>;
  getDiagnosesHistory(req: Request): Promise<DiagnosisHistory[]>;
  changeDiagnosisConfirmation(req: Request): Promise<DiagnosisConfirmation>;
}
