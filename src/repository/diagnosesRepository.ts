import client from 'models/client';
import { Diagnosis, Prisma } from '@prisma/client';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { IDiagnosesRepository } from 'repositoryTypes/IDiagnosesRepository';
import { DiagnosisHistory } from 'models/responses/diagnosis/Diagnosis';

@injectable()
class DiagnosesRepository implements IDiagnosesRepository {
  public async saveDiagnoses(diagnosesData: Prisma.DiagnosisCreateManyInput[]): Promise<void> {
    await client.diagnosis.createMany({
      data: diagnosesData,
    });
  }

  public async getDiagnosesHistory(userId: number): Promise<DiagnosisHistory[]> {
    const diagnoses = await client.diagnosis.findMany({
      where: {
        userId,
      },
      select: {
        issueId: true,
        name: true,
        accuracy: true,
        id: true,
        confirmed: true,
      },
    });

    return diagnoses.map((diagnosis: DiagnosisHistory) => {
      const { issueId, name, accuracy, id, confirmed } = diagnosis;

      return {
        issueId,
        name,
        accuracy,
        id,
        confirmed,
      };
    });
  }

  public async updateDiagnosisConfirmation(diagnosisId: number, confirmed: boolean): Promise<Diagnosis> {
    return await client.diagnosis.update({
      where: {
        id: diagnosisId,
      },
      data: {
        confirmed,
      },
    });
  }

  public async getDiagnosisById(diagnosisId: number): Promise<Diagnosis | null> {
    return await client.diagnosis.findUnique({
      where: {
        id: diagnosisId,
      },
    });
  }
}

export default DiagnosesRepository;
