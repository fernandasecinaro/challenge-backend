import { Diagnosis, Prisma } from '@prisma/client';
import { DiagnosisHistory } from 'models/responses/diagnosis/Diagnosis';

export interface IDiagnosesRepository {
  saveDiagnoses(diagnoses: Prisma.DiagnosisCreateManyInput[]): Promise<void>;
  getDiagnosesHistory(userId: number): Promise<DiagnosisHistory[]>;
  updateDiagnosisConfirmation(diagnosisId: number, confirmed: boolean): Promise<Diagnosis>;
  getDiagnosisById(diagnosisId: number): Promise<Diagnosis | null>;
}
